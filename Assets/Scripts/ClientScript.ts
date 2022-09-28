import { Room } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { WorldService, ZepetoWorldMultiplay } from 'ZEPETO.World';
import { Player, State } from 'ZEPETO.Multiplay.Schema';
import { CharacterState, SpawnInfo, ZepetoCharacter, ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { Debug, GameObject, Quaternion, Transform, Vector3, WaitForSeconds } from 'UnityEngine';
import { MultiplayMessageChangeGroundColor, MultiplayMessageCharacterState, MultiplayMessageCharacterTransform, MultiplayMessageType } from './MultiplayMessage';
import GroundManager from './GroundManager';
import Ground from './Ground';
import GameUI from './GameUI';



/** 게임에 사용될 팀 정보 정의 */
type GameTeamInfo = {

    /** 플레이어의 제페토캐릭터 */
    character: ZepetoCharacter,

    /** 플레이어의 팀 정보 */
    team: number
}



/** 클라이언트 클래스 */
export default class ClientScript extends ZepetoScriptBehaviour {



    /* Singleton */

    /** ClientScript 클래스가 담겨있는 인스턴스 */
    private static instance: ClientScript;

    /** ClientScript의 함수나 변수에 접근할 수 있도록 인스턴스를 반환해줄 함수 */
    static GetInstance(): ClientScript {
        if (!ClientScript.instance) {
            const targetObj = GameObject.Find("Client");
            if (targetObj) ClientScript.instance = targetObj.GetComponent<ClientScript>();
        }
        return ClientScript.instance;
    }



    /* Multiplay */

    /** 멀티플레이 관련 다양한 기능들이 담겨있는 멤버 변수 */
    public multiplay: ZepetoWorldMultiplay;

    /** 입장한 room 정보와 기능이 담겨있는 멤버 변수 */
    public multiplayRoom: Room;

    /** 플레이어들의 정보가 담겨있는 멤버 변수 */
    private multiplayPlayers: Map<string, Player> = new Map<string, Player>();

    /** SpawnLocation */
    public spawnLocation: GameObject;

    /** 따로 저장된 멀티플레이 스키마 */
    private multiplayState: State;

    /** ZepetoPlayers 오브젝트 */
    public objZepetoPlayers: ZepetoPlayers;



    Start() {
        // Room이 생성되면
        this.multiplay.RoomCreated += (room: Room) => {
            // multiplayRoom 변수에 생성된 Room 객체 저장
            this.multiplayRoom = room;
        };

        // Room에 접속하고 나면
        this.multiplay.RoomJoined += (room: Room) => {
            // RoomState가 변경될 때마다 OnStateChange() 함수 호출하기 위해 room.OnStateChange 이벤트 등록
            room.OnStateChange += this.OnStateChange;


            /** 메세지 수신 이벤트 등록 */

            // 블록 색 변경 메세지 수신
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.ChangeGroundColorReceive, (message: MultiplayMessageChangeGroundColor) => {
                // 전달 받은 오브젝트 이름을 클라이언트에서 검색하여
                // 해당 오브젝트의 Color 속성을 팀 색으로 변경하는 코드 작성


                /* 밟힌 ground 오브젝트의 Ground 스크립트 컴포넌트 찾기 */

                const groundManager = GroundManager.GetInstance();

                // message로 전달받은 밟힌 오브젝트의 이름에서 번호만 가져오기
                // stirng.split(): 괄호 안에 지정한 문자를 기준으로 string을 여러 배열로 나누는 문법
                // Ground_14.split("_")[1]: Ground_14에서 _ 를 기준으로 나누어서 반환된 배열 타입의 결과([Ground, 14])에서 두 번째 값인 14를 가져오기 위해 0번째가 아닌 1번째 값을 groundNumber 변수에 저장
                const groundNumber = Number(message.groundName.split("_")[1]);

                // 밟은 오브젝트에 연결돼있는 Ground 컴포넌트 가져오기
                const ground: Ground = groundManager?.groundList[groundNumber].GetComponent<Ground>();

                // ground 색 변경
                ground?.SetType(message.team);

                // GameUI 가져오기
                const gameUI = GameUI.GetInstance();

                // 점수 갱신
                gameUI.UpdateScore();
            });

            // Waiting 상태로 변경될 때
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.Waiting, (message => {

                // GameUI 가져오기
                const gameUI = GameUI.GetInstance();

                // 결과 화면 비활성화
                gameUI?.DisableResult();

                // 점수판 안보이게
                gameUI?.OnOffScoreboard(false);

                // 플레이어 캐릭터 위치 각 팀 진영으로 재설정, ground 색 초기화
                this.ResetGame();

                // 캐릭터 컨트롤 활성화
                this.OnOffCharacterControl(true);
            }));

            // GameReady 메세지 수신 시
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.GameReady, (message => {

                // GameUI 가져오기
                const gameUI = GameUI.GetInstance();

                // Ready 오브젝트 활성화
                gameUI?.OnOffGameReady(true);

                // Ready 이미지 표시
                gameUI?.ShowGameReady();

                // 플레이어 캐릭터 위치 각 팀 진영으로 재설정, ground 색 초기화
                this.ResetGame();

                // 캐릭터 컨트롤 비활성화
                this.OnOffCharacterControl(false);
            }));

            // GameStart 상태로 변경될 때
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.GameStart, (message => {

                // 플레이어 캐릭터 위치 각 팀 진영으로 재설정, ground 색 초기화
                this.ResetGame();

                // GameUI 가져오기
                const gameUI = GameUI.GetInstance();

                // Start 오브젝트 활성화
                gameUI?.OnOffGameStart(true);

                // Start 이미지 표시
                gameUI?.ShowGameStart();

                // 점수판 표시
                gameUI?.OnOffScoreboard(true);

                // 캐릭터 컨트롤 활성화
                this.OnOffCharacterControl(true);
            }));

            // Game Finish 메세지 수신 시
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.GameFinish, (message => {

                // GameUI 가져오기
                const gameUI = GameUI.GetInstance();

                // Finish 오브젝트 활성화
                gameUI?.OnOffGameFinish(true);

                // Finish 이미지 표시
                gameUI?.ShowGameFinish();

                // 캐릭터 컨트롤 비활성화
                this.OnOffCharacterControl(false);
            }));

            // Result 상태로 변경될 때
            this.multiplayRoom.AddMessageHandler(MultiplayMessageType.Result, (message => {

                // 승자 찾고 결과 화면 보여주기
                GameUI.GetInstance()?.SetResult();
            }));
        };
    }

    /** State 변경 이벤트 */
    private OnStateChange(state: State, isFirst: boolean) {

        // 스테이트 별도로 저장(캐싱)
        this.multiplayState = state;

        // 첫 번째 State 변경 이벤트인 경우
        if (isFirst) {

            // 이미 존재하는 유저정보가 있다면 해당 유저를 로컬에 신규등록
            state.players.ForEach((userId, player) => { this.OnPlayerAdd(player, userId) });

            // 앞으로 추가되는 Players 관련 이벤트 등록
            state.players.add_OnAdd((player, userId) => { this.OnPlayerAdd(player, userId) });
            state.players.add_OnRemove((player, userId) => { this.OnPlayerRemove(player, userId) });
            state.counter.add_OnChange(() => { this.OnCounterChange(state.counter.count) });

            this.InitializeCharacter();
        }
    }

    /** 플레이어가 접속하여 서버의 OnJoin() 함수 내부에서 RoomState에 저장된 데이터에 플레이어 데이터가 추가될 때 호출될 함수 */
    private OnPlayerAdd(player: Player, userId: string) {
        if (this.multiplayPlayers.has(userId)) return;

        // multiplayPlayers에 저장
        this.multiplayPlayers.set(userId, player);

        /** 생성할 캐릭터의 스폰 정보 설정 */
        const spawnInfo = new SpawnInfo();
        const position = this.spawnLocation.transform.position;
        spawnInfo.position = position;
        spawnInfo.rotation = Quaternion.identity;

        // 내 캐릭터 여부 확인 (true/false)
        // WorldService.userId: 로컬 플레이어의 userId를 가져와줌
        const isLocal = WorldService.userId === userId;

        // 캐릭터 생성
        ZepetoPlayers.instance.CreatePlayerWithUserId(userId, userId, spawnInfo, isLocal);
    }

    /** 퇴장한 플레이어의 캐릭터와 관련 정보를 삭제하는 함수 (스키마에서 플레이어 정보 삭제시 호출될 함수) */
    private OnPlayerRemove(player: Player, userId: string) {
        if (!this.multiplayPlayers.has(userId)) return;
        ZepetoPlayers.instance.RemovePlayer(userId);
    }



    /** 서버에서 계산된 count값이 변경될 때 실행될 함수 */
    private OnCounterChange(count) {

        // 게임 종료 후 타이머 값이 -1, -2, -3으로 표시되는 것을 방지하기 위해 counter.count 값이 0 이상일 때만 count 갱신
        if (count >= 0) {
            GameUI.GetInstance().TimerText.text = count.toString();
        }
    }

    /** 일정 Interval Time 으로 내 캐릭터의 transform을 server 로 전송 */
    private *SendMessageCharacterTransformLoop(tick: number) {
        while (true) {

            // tick 시간 만큼 대기
            yield new WaitForSeconds(tick);

            // Room 이 존재하고 접속되어있는 상황에서만 동작
            if (this.multiplayRoom != null && this.multiplayRoom.IsConnected) {

                // 자신의 userId 추출
                const userId = WorldService.userId;

                // 내 플레이어가 존재하는 경우에만 동작
                if (ZepetoPlayers.instance.HasPlayer(userId)) {

                    // 내 캐릭터 추출
                    const character = ZepetoPlayers.instance.GetPlayer(userId).character;

                    // 캐릭터의 현재 상태가 Idle 이 아니라면 현재 상태를 전송
                    if (character.CurrentState != CharacterState.Idle)
                        this.SendMessageCharacterTransform(character.transform);
                }
            }
        }
    }

    /** 캐릭터의 트랜스폼 변경을 서버로 전송 */
    private SendMessageCharacterTransform(transform: Transform) {

        // 트랜스폼 정보 추출
        const position = transform.localPosition;

        // 메시지 생성
        const message: MultiplayMessageCharacterTransform = {
            positionX: position.x,
            positionY: position.y,
            positionZ: position.z
        }

        // 메시지 전송
        this.multiplayRoom.Send(MultiplayMessageType.CharacterTransform, message);
    }

    /** 캐릭터의 State 변경을 서버로 전송 */
    private SendMessageCharacterState(characterState: CharacterState) {

        // 현재 State 변경사항을 서버로 전송
        const message: MultiplayMessageCharacterState = {
            characterState: characterState
        }

        // 메시지 전송
        this.multiplayRoom.Send(MultiplayMessageType.CharacterState, message);
    }

    /** Room에 플레이어가 완전히 접속했을 때 관련 이벤트를 등록해주는 함수 */
    private InitializeCharacter() {

        // 로컬 플레이어가 Room에 완전히 접속되었을 때 발생되는 이벤트
        ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {

            // 내 캐릭터 (LocalPlayer) 추출
            const zepetoPlayer = ZepetoPlayers.instance.LocalPlayer.zepetoPlayer;

            // userId 추출
            const userId = WorldService.userId;

            // 캐릭터 오브젝트의 이름을 userId 로 변경
            zepetoPlayer.character.name = userId;

            // CharacterState가 변경될 때 마다 current 정보를 서버로 전송
            zepetoPlayer.character.OnChangedState.AddListener((current, previous) => {
                this.SendMessageCharacterState(current);
            });

            // 0.1 초에 한번씩 내 캐릭터의 transform 변경사항을 체크하여 서버로 전송
            this.StartCoroutine(this.SendMessageCharacterTransformLoop(0.1));
        });

        // 로컬 플레이어, 다른 플레이어 관계없이 플레이어가 Room에 완전히 접속되었을 때 발생되는 이벤트
        ZepetoPlayers.instance.OnAddedPlayer.AddListener((userId: string) => {

            // 생성된 플레이어 추출
            const zepetoPlayer = ZepetoPlayers.instance.GetPlayer(userId);

            // 캐릭터 오브젝트의 이름을 userId 로 변경
            zepetoPlayer.character.name = userId;

            // GameTeamInfo 생성
            const teamInfo: GameTeamInfo = {
                character: zepetoPlayer.character,
                team: this.multiplayState.players.get_Item(userId).team
            }

            // 팀 정보 저장해두기
            this.gameTeamList.set(zepetoPlayer.character.name, teamInfo);

            // ========== 숙제 코드 위치 ==========
            // GameUI에 플레이어 썸네일 저장해두기 (GameUI에 playerThumbnails 이름의 썸네일 저장용 변수가 이미 선언되어 있습니다.)
            const gameUI = GameUI.GetInstance();
            gameUI?.GetThumbnail(userId);

            /* 
                캐릭터 위치 동기화
                플레이어가 접속하면 해당 플레이어를 제외한 다른 플레이어들의 캐릭터 위치가 변경되었을 때 해당 캐릭터 위치를 재설정 해주는 역할을 수행함
            */
            // 각 플레이어에가 접속할 때마다 해당 플레이어의 데이터를 RoomState에서 userId로 불러와 playerState에 저장
            const player: Player = this.multiplayRoom.State.players.get_Item(userId);

            // 해당 플레이어의 transform이 변경될 때마다 처리할 이벤트 등록
            player.position.OnChange += () => {

                // 로컬 플레이어가 아닌 경우에만
                if (zepetoPlayer.isLocalPlayer == false) {

                    // 변경된 위치 가져오기
                    const x = player.position.x;
                    const y = player.position.y;
                    const z = player.position.z;
                    const position = new Vector3(x, y, z);

                    // // 일정거리 이상 떨어지면 캐릭터 위치 재설정
                    if (Vector3.Distance(position, zepetoPlayer.character.transform.position) > 7) {
                        zepetoPlayer.character.transform.position = position;
                    }

                    // position 갱신
                    zepetoPlayer.character.MoveToPosition(position);

                    /* characterState 갱신 (점프 상태라면 점프 모션으로 변경) */
                    if (player.characterState === CharacterState.JumpIdle || player.characterState === CharacterState.JumpMove)
                        zepetoPlayer.character.Jump();
                }
            }
        });
    }

    /* Game Team */

    /** 플레이어의 팀 정보 (캐릭터가 추가될 때, 사라질 때 동기화. character 오브젝트의 이름과 side 정보를 연동시킴) */
    public gameTeamList: Map<string, GameTeamInfo> = new Map<string, GameTeamInfo>();

    /** 충돌체를 통해 얻어진 게임오브젝트의 이름 (userId) 으로 무슨 팀인지 얻어올 수 있음 */
    GetTeam(gameObjectName: string) {
        if (!this.gameTeamList.has(gameObjectName)) return 0;
        return this.gameTeamList.get(gameObjectName).team;
    }


    /** 캐릭터 컨트롤 활성화/비활성화 함수 */
    OnOffCharacterControl(bool: boolean) {
        if (bool) {
            // 이동 속도 및 점프력 활성화
            this.objZepetoPlayers.characterData.walkSpeed = 2;
            this.objZepetoPlayers.characterData.runSpeed = 5;
            this.objZepetoPlayers.characterData.jumpPower = 5;
        } else {
            // 이동 속도 및 점프력 비활성화
            this.objZepetoPlayers.characterData.walkSpeed = 0;
            this.objZepetoPlayers.characterData.runSpeed = 0;
            this.objZepetoPlayers.characterData.jumpPower = 0;
        }
    }

    /** 게임을 리셋합니다. */
    ResetGame() {

        // 팀 정보를 바탕으로 팀별 위치로 캐릭터 순간이동
        this.gameTeamList.forEach(info => {
            info.character.Teleport(new Vector3(-3.5 + (7 * (info.team - 1)), 1, 0), Quaternion.identity);
        });

        // 그라운드 리셋
        GroundManager.GetInstance()?.ResetGround();

        // 점수판 리셋
        GameUI.GetInstance()?.ResetScoreboard();
    }

}