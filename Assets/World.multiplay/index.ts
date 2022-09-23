import { Sandbox, SandboxOptions, SandboxPlayer } from "ZEPETO.Multiplay";
import { Player, Vector3Schema } from "ZEPETO.Multiplay.Schema";



/* Message */

/** 클라이언트와의 메시지 통신 정의 */
// enum을 정의하면 반복적으로 사용하는 문자열을 오타없이 이용할 수 있습니다.
// 서버 단 스크립트는 외부 스크립트를 import하여 사용하지 않습니다. 반드시 필요한 부분을 복사, 붙여넣기 후 사용해주시기 바랍니다.
enum MultiplayMessageType {

    /** Waiting 상태 진입 메시지 */
    Waiting = "Waiting",

    /** GameReady 메시지 */
    GameReady = "GameReady",

    /** GameStart 상태 진입 메시지 */
    GameStart = "GameStart",

    /** GameFinish 메시지 */
    GameFinish = "GameFinish",

    /** Result 상태 진입 메시지 */
    Result = "Result",

    /** 캐릭터의 Transform 갱신 메시지 */
    CharacterTransform = "CharacterTransform",

    /** 캐릭터의 State 갱신 메시지*/
    CharacterState = "CharacterState",

    /** Ground의 Color 갱신 메세지 */
    ChangeGroundColor = "ChangeGroundColor",

    /** Ground Color 갱신 수신 메세지 */
    ChangeGroundColorReceive = "ChangeGroundColorReceive",
}


/** 메시지 내용 정의 (CharacterTransform) */
type MultiplayMessageCharacterTransform = {

    /** 포지션 정보 */
    positionX: number,
    positionY: number,
    positionZ: number
}

/** 메시지 내용 정의 (CharacterState) */
type MultiplayMessageCharacterState = {
    characterState: number
}

/** Ground Color 변경 메세지 내용 정의 */
type MultiplayMessageChangeGroundColor = {
    /** 기존 ground 색 */
    groundType: number,
    /** 밟은 팀 */
    team: number,
    /** 밟힌 ground 이름 */
    groundName: string,
}

// ========== 추가
/** 메시지 내용 정의 (Waiting) */
type MultiplayMessageWaiting = {

}

/** 메시지 내용 정의 (GameReady) */
type MultiplayMessageGameReady = {

}

/** 메시지 내용 정의 (GameStart) */
type MultiplayMessageGameStart = {

}

/** 메시지 내용 정의 (GameFinish) */
type MultiplayMessageGameFinish = {

}

/** 메시지 내용 정의 (Result) */
type MultiplayMessageResult = {

}



/* Game State */

/** 게임의 상태 정의 */
enum GameState {

    /** 인원수가 부족하여 다른 유저를 기다리는 상태 */
    Wait,

    /** 인원수가 충족되어 게임중인 상태 */
    Game,

    /** 결과를 확인하는 상태 */
    Result
}
// ========== 추가



// 서버 기능을 수행하는 클래스
export default class extends Sandbox {
    // 습관처럼 적어주세요
    constructor() {
        super();
    };

    /* Multiplay Message */

    InitializeMultiplayMessage() {

        // CharacterTransform 메시지 등록
        this.onMessage(MultiplayMessageType.CharacterTransform, (client, message: MultiplayMessageCharacterTransform) => {

            // userId 가 players 스키마에 존재한다면 진행
            const userId = client.userId;
            if (!this.state.players.has(userId)) return;

            // 플레이어의 포지션과 로테이션 정보 갱신
            const player = this.state.players.get(userId);

            // 포지션 갱신
            const position = new Vector3Schema();
            position.x = message.positionX;
            position.y = message.positionY;
            position.z = message.positionZ;
            player.position = position;

        });

        // CharacterState 메시지 등록
        this.onMessage(MultiplayMessageType.CharacterState, (client, message: MultiplayMessageCharacterState) => {

            // 플레이어의 characterState 갱신
            const player = this.state.players.get(client.userId);
            player.characterState = message.characterState;
        });

        // ChangeGroundColor 메세지 등록
        this.onMessage(MultiplayMessageType.ChangeGroundColor, (client, message: MultiplayMessageChangeGroundColor) => {
            // 모든 클라이언트에게 Ground Color 갱신하도록 밟힌 ground 오브젝트 이름과 밟은 팀 정보를 메세지로 전송
            this.broadcast(MultiplayMessageType.ChangeGroundColorReceive, message);
        });
    }



    /* Game State */

    /** 게임 상태. 초기값은 Init */
    private gameState = GameState.Wait;

    /** Game 상태를 설정 */
    SetGameState(gameState: GameState) {

        // 상태 저장
        this.gameState = gameState;

        // 상태 초기화 함수 실행
        switch (gameState) {
            case GameState.Wait: this.InitializeWait(); break;
            case GameState.Game: this.InitializeGame(); break;
            case GameState.Result: this.InitializeResult(); break;
        }
    }

    

    // ========== 추가
    /* SendMessage */

    /** 메시지 전송 (Waiting) */
    SendMessageWaiting() {

        // 메시지 생성
        const message: MultiplayMessageWaiting = {};

        // 상태 변경 메시지 브로드캐스트
        this.broadcast(MultiplayMessageType.Waiting, message);
    }

    /** 메세지 전송 (Ready) */
    SendMessageGameReady() {

        // 메세지 생성
        const message: MultiplayMessageGameReady = {};

        // 메세지 브로드캐스트
        this.broadcast(MultiplayMessageType.GameReady, message);
    }

    /** 메시지 전송 (GameStart) */
    SendMessageGameStart() {

        // 메시지 생성
        const message: MultiplayMessageGameStart = {};

        // 상태 변경 메시지 브로드캐스트
        this.broadcast(MultiplayMessageType.GameStart, message);
    }

    /** 메시지 전송 (GameFinish) */
    SendMessageGameFinish() {

        // 메시지 생성
        const message: MultiplayMessageGameFinish = {};

        // 상태 변경 메시지 브로드캐스트
        this.broadcast(MultiplayMessageType.GameFinish, message);
    }

    /** 메시지 전송 (Result) */
    SendMessageResult() {

        // 메시지 생성
        const message: MultiplayMessageResult = {};

        // 상태 변경 메시지 브로드캐스트
        this.broadcast(MultiplayMessageType.Result, message);
    }
    
    
    
    /* Wait */

    /** 게임 시작에 필요한 유저의 수 정의 */
    private readonly gameStartCount = 2;

    /** 현재 접속된 유저의 수 */
    private currentPlayerCount: number = 0;

    /** 상태 초기화 함수 */
    InitializeWait() {

        // 변수 초기화
        this.gameTime = 0;

        // 메시지 전송
        this.SendMessageWaiting();
    }

    /** 업데이트 함수 */
    UpdateWait(deltaTime: number) {

        // 게임 상태가 Wait 이 아니라면 리턴
        if (this.gameState != GameState.Wait) return;
        console.log(`UpdateWait()`);

        // 현재 접속된 유저의 수 갱신
        this.currentPlayerCount = this.state.players.size;

        // 적정 인원이 채워졌다면
        if (this.currentPlayerCount == this.gameStartCount) {
            // 게임 시작에 필요한 인원수가 채워졌다면 플레이어들에게 GameReady 메세지 전송
            if (this.gameTime == 0) this.SendMessageGameReady();

            this.gameTime += deltaTime;

            // 4초 경과 후 Game 상태로 변경
            if (this.gameTime >= 4000) this.SetGameState(GameState.Game);
        }
    }



    /* Game */

    /** 게임의 진행 시간 정의 (60초) */
    private readonly gameDuration: number = 60 * 1000;

    /** Game 의 시간 변수 */
    private gameTime: number = 0;

    /** 상태 초기화 함수 */
    InitializeGame() {

        // 변수 초기화
        this.gameTime = 0;

        // count 변경
        this.state.counter.count = 60;

        // 게임 시작 메시지 전송
        this.SendMessageGameStart();
    }

    /** 업데이트 함수 */
    UpdateGame(deltaTime: number) {

        // 게임 상태가 Game 이 아니라면 리턴
        if (this.gameState != GameState.Game) return;
        console.log(`UpdateGame()`);

        // gameTime 갱신
        this.gameTime += deltaTime;

        // count 갱신
        // (카운트할 숫자 - 경과된 시간)
        // (3000 + 1000) - (101.. 1021.. 2025.. 3032..)
        // Math.floor(): 소수점 이하 내림하여 정수로 처리
        // +1000(+1초)를 하는 이유: 실제 계산을 수행하면 Math.floor()로 인해 내림 처리가 발생하여 60초에서 0.001초만 지나도 59초로 내려진 값이 counter.count에 들어가기 때문에 실제 60초를 체감시키기 위해 1초를 더해서 계산
        // 0.001를 곱하는 이유: ms(1000)단위를 초(1)단위로 변경하기 위함
        this.state.counter.count = Math.floor(((this.gameDuration + 1000) - this.gameTime) * 0.001);
        /*
            console.log( Math.floor((60000 - 101) * 0.001) )
            console.log( Math.floor((60000 - 1021) * 0.001) )
            console.log( Math.floor((60000 - 2925) * 0.001) )
            console.log( Math.floor((60000 - 3032) * 0.001) )
            console.log( Math.floor((60000 - 4932) * 0.001) )
            console.log( Math.floor((60000 - 5032) * 0.001) )
        */

        // counter.count가 0초가 되었을 때
        if (this.state.counter.count == 0) this.SendMessageGameFinish();

        // Finish 이미지를 띄우고 나서 3초 뒤에 결과 화면 보여주기
        if (this.gameTime >= this.gameDuration + (3 * 1000)) this.SetGameState(GameState.Result);
    }



    /* Result */

    /** 결과상태의 진행 시간 정의 (10초) */
    private readonly resultDuration: number = 10 * 1000;

    /** Result 의 시간 변수 */
    private resultTime: number = 0;

    /** 상태 초기화 함수 */
    InitializeResult() {

        // 변수 초기화
        this.resultTime = 0;

        // 메시지 전송
        this.SendMessageResult();
    }

    /** 업데이트 함수 */
    UpdateResult(deltaTime: number) {

        // Result 상태가 아니라면 리턴
        if (this.gameState != GameState.Result) return;
        console.log(`UpdateResult()`);

        // resultTime 갱신
        this.resultTime += deltaTime;

        // resultTime 이 설정된 진행시간보다 길어지면 Wait 상태로 변경
        if (this.resultTime >= this.resultDuration) this.SetGameState(GameState.Wait);
    }
    // ========== 추가



    /* Multiplay Event */

    // 방 생성 시 호출되는 기본 제공 함수
    onCreate(options: SandboxOptions) {

        this.InitializeMultiplayMessage();
    };

    // 사용자가 방에 입장했을 때 호출되는 기본 제공 함수
    onJoin(client: SandboxPlayer) {

        // UserId 추출
        const userId = client.userId;

        // 플레이어 정보 생성
        const player = new Player();

        // Player RoomState(스키마) 내용으로 player 변수 정의
        player.userId = userId;

        // Vector3Schema RoomState(스키마) 내용으로 player state 내에 있는 position 내용 정의
        player.position = new Vector3Schema();

        // player의 position 내 x 값 0으로 설정
        player.position.x = 0;

        // player의 position 내 y 값 0으로 설정
        player.position.y = 0;

        // player의 position 내 z 값 0으로 설정
        player.position.z = 0;

        // 플레이어 정보 저장
        this.state.players.set(userId, player);

        // 팀 설정 (플레이어의 수에 맞춰서 팀 설정)
        player.team = this.state.players.size;
    };

    // 플레이어가 방에서 나갈 때 호출되는 기본 제공 함수
    onLeave(client: SandboxPlayer, consented: boolean) {

        // UserId 추출
        const userId = client.userId;

        // 유저 정보 삭제
        this.state.players.delete(userId);
    };

    // ========== 추가
    /** 업데이트 이벤트 */
    onTick(deltaTime: number): void {
        this.UpdateWait(deltaTime);
        this.UpdateGame(deltaTime);
        this.UpdateResult(deltaTime);
    }
    // ========== 추가
};