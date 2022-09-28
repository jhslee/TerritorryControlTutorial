import { Animator, Color, GameObject, Rect, Sprite, Texture, Texture2D, Vector2 } from 'UnityEngine'
import { Image, Text } from 'UnityEngine.UI';
import { ZepetoPlayers } from 'ZEPETO.Character.Controller';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { ZepetoWorldHelper } from 'ZEPETO.World';
import GroundManager from './GroundManager';
import ClientScript from './ClientScript';
import { TextMeshProUGUI } from 'TMPro';



/** 그라운드의 타입 정의 */
enum GroundType { None, Red, Purple }

/** Grounds 타입 정의 */
type Grounds = {
    Red: number,
    Purple: number
}



/** 게임의 UI 를 관리하는 클래스 입니다. */
export default class GameUI extends ZepetoScriptBehaviour {



    /* Singleton */

    /** GameUI 클래스가 담겨있는 인스턴스 */
    private static instance: GameUI;

    /** GameUI의 함수나 변수에 접근할 수 있도록 인스턴스를 반환해줄 함수 */
    static GetInstance(): GameUI {
        if (!GameUI.instance) {
            const targetObj = GameObject.Find("GameUI");
            if (targetObj) GameUI.instance = targetObj.GetComponent<GameUI>();
        }
        return GameUI.instance;
    }



    /* Game UI */

    /** GameReady 이미지 오브젝트 */
    public GameReady: GameObject;

    /** GameReady 이미지 오브젝트 */
    public GameReadyAnimator: Animator;

    /** GameStart 이미지 오브젝트 */
    public GameStart: GameObject;

    /** GameStart 이미지 오브젝트 */
    public GameStartAnimator: Animator;

    /** GameFinish 이미지 오브젝트 */
    public GameFinish: GameObject;

    /** GameFinish 이미지 오브젝트 */
    public GameFinishAnimator: Animator;

    /** Result UI 오브젝트 */
    public Result: GameObject;

    /** Result 화면 배경 오브젝트 */
    public ResultBackground: Image;

    /** 승부가 가려졌을 때 (무승부가 아닐 때) 보여질 Result 화면 */
    public ResultWin: GameObject;

    /** 무승부가 되었을 때 보여질 Result 화면 */
    public ResultDraw: GameObject;

    /** 승부가 가려졌을 때 보이는 Result 화면의 TitleText 오브젝트 */
    public WinTitleText: TextMeshProUGUI;

    /** 승부가 가려졌을 때 보이는 Result 화면의 DescriptionText 오브젝트 */
    public WinDescText: TextMeshProUGUI;

    /** 승부가 가려졌을 때 보이는 Result 화면의 TitleText 오브젝트 */
    public DrawTitleText: TextMeshProUGUI;

    /** 점수판 오브젝트 */
    public Scoreboard: GameObject;

    /** 타이머 텍스트 오브젝트 */
    public TimerText: TextMeshProUGUI;

    /** 점수판 중 Red Team Score Text */
    public RedTeamScore: TextMeshProUGUI;

    /** 점수판 중 Purple Team Score Text */
    public PurpleTeamScore: TextMeshProUGUI;

    /** 승자의 캐릭터 프로필 썸네일 이미지가 저장될 변수 */
    public WinnerThumbnail: Image;

    /** 모든 플레이어의 썸네일이 미리 저장될 변수 */
    public playerThumbnails = new Map<string, Sprite>();

    /** Red Team Color */
    private redTeamColor = new Color(232 / 255, 52 / 255, 78 / 255);

    /** purple Team Color */
    private purpleTeamColor = new Color(92 / 255, 70 / 255, 255 / 255);

    /** White Color */
    private WhiteColor = new Color(255 / 255, 255 / 255, 255 / 255);

    /** true/false에 따라 Ready 이미지 오브젝트 화면에 보여주거나 보이지 않게 하는 함수 */
    OnOffGameReady(bool: boolean) {
        this.GameReady.SetActive(bool);
        this.GameStart.SetActive(!bool);
        this.GameFinish.SetActive(!bool);
    }

    /** GameReady 이미지 애니메이션 실행 함수 */
    ShowGameReady() {
        this.GameReadyAnimator.SetTrigger("Play");
    }

    /** true/false에 따라 Ready 이미지 오브젝트 화면에 보여주거나 보이지 않게 하는 함수 */
    OnOffGameStart(bool: boolean) {
        this.GameReady.SetActive(!bool);
        this.GameStart.SetActive(bool);
        this.GameFinish.SetActive(!bool);
    }

    /** GameStart 이미지 애니메이션 실행 함수 */
    ShowGameStart() {
        this.GameStartAnimator.SetTrigger("Play");
    }

    /** true/false에 따라 점수판 오브젝트 화면에 보여주거나 보이지 않게 하는 함수 */
    OnOffScoreboard(bool: boolean) {
        this.Scoreboard.SetActive(bool);
    }

    /** 점수판 점수 초기화 함수 */
    ResetScoreboard() {
        this.RedTeamScore.text = '0';
        this.PurpleTeamScore.text = '0';
    }

    /** true/false에 따라 Ready 이미지 오브젝트 화면에 보여주거나 보이지 않게 하는 함수 */
    OnOffGameFinish(bool: boolean) {
        this.GameReady.SetActive(!bool);
        this.GameStart.SetActive(!bool);
        this.GameFinish.SetActive(bool);
    }

    /** GameFinish 이미지 애니메이션 실행 함수 */
    ShowGameFinish() {
        this.GameFinishAnimator.SetTrigger("Play");
    }

    /** gound의 타입 갯수에 따라 점수를 갱신해주는 함수 */
    UpdateScore() {

        // GroundManager 가져오기
        const groundManager = GroundManager.GetInstance();

        // groundType들이 정리된 객체 생성
        const grounds: Grounds = {
            Red: 0,
            Purple: 0
        };

        // ground의 Type을 가져와서 grounds 객체에 점수 생성
        groundManager.groundList.forEach((v, i) => {
            // v.GetType()의 return 값을 여러 case로 구분하여 수행할 동작을 다르게 할 수 있음
            // if문은 순서대로 여러 조건을 확인하지만 switch/case문은 여러 조건 중에 해당하는 case만 골라서 코드를 실행함
            // if는 복잡한 조건을 사용하기에 적합하고, switch/case는 단순한 조건을 사용할 때 적합
            switch (v.GetType()) {
                // case가(v.GetType()의 리턴값이) GroundType.Red와 일치할 경우
                case GroundType.Red:
                    grounds.Red += 1;
                    break;
                // case가 GroundType.Purple과 일치할 경우
                case GroundType.Purple:
                    grounds.Purple += 1;
                    break;
            }
        });

        // 점수 반영
        this.RedTeamScore.text = grounds.Red.toString();
        this.PurpleTeamScore.text = grounds.Purple.toString();
    }

    /** 결과 화면을 보이지 않도록 하는 함수 */
    DisableResult() {
        // Win 오브젝트, Draw 오브젝트, Result 오브젝트 비활성화
        this.ResultWin.SetActive(false);
        this.ResultDraw.SetActive(false);
        this.Result.SetActive(false);
    }

    /** 승자를 찾아 결과 화면을 승자의 정보로 세팅하고 보여주는 함수 */
    SetResult() {

        // 팀 점수 가져오기
        const redTeamScore = Number(this.RedTeamScore.text);
        const purpleTeamScore = Number(this.PurpleTeamScore.text);

        // Red team victory
        if (redTeamScore > purpleTeamScore) {
            // 승자(Red Team) userId 찾기
            const winnerUserId = this.getWinnerUserId(GroundType.Red);
            // 승자 이름 찾기
            const winnerName = ZepetoPlayers.instance.GetPlayerWithUserId(winnerUserId).name;
            // Win 오브젝트 내 Title Text 오브젝트의 텍스트를 "Red Team 승리!"로 변경
            this.WinTitleText.text = "Red Team Victory!";
            // ========== 숙제 코드 위치 ==========
            // 썸네일 교체
            this.WinnerThumbnail.sprite = this.playerThumbnails.get(winnerUserId);
            // Win 오브젝트 내 Description 오브젝트의 텍스트를 승자의 닉네임으로 설정
            this.WinDescText.text = winnerName;
            // Result 오브젝트 내 Background 이미지 오브젝트 배경색을 승팀의 배경색으로 변경
            this.ChangeImageBackgroundColor(this.ResultBackground, this.redTeamColor);
            // 결과 화면이 보이도록 Result 오브젝트 활성화
            this.Result.SetActive(true);
            // Draw 오브젝트 대신 Win 오브젝트가 보이도록 활성화
            this.ResultWin.SetActive(true);
        }
        // Purple Team Victory
        else if (purpleTeamScore > redTeamScore) {
            // 승자(Purple Team) userId 찾기
            const winnerUserId = this.getWinnerUserId(GroundType.Purple);
            // 승자 이름 찾기
            const winnerName = ZepetoPlayers.instance.GetPlayerWithUserId(winnerUserId).name;
            // Win 오브젝트 내 Title Text 오브젝트의 텍스트를 "Purple Team 승리!"로 변경
            this.WinTitleText.text = "Purple Team 승리!";
            // ========== 숙제 코드 위치 ==========
            // 썸네일 교체
            this.WinnerThumbnail.sprite = this.playerThumbnails.get(winnerUserId);
            // Win 오브젝트 내 Description 오브젝트의 텍스트를 승자의 닉네임으로 설정
            this.WinDescText.text = winnerName;
            // Result 오브젝트 내 Background 이미지 오브젝트 배경색을 승팀의 배경색으로 변경
            this.ChangeImageBackgroundColor(this.ResultBackground, this.purpleTeamColor);
            // 결과 화면이 보이도록 Result 오브젝트 활성화
            this.Result.SetActive(true);
            // Draw 오브젝트 대신 Win 오브젝트가 보이도록 활성화
            this.ResultWin.SetActive(true);
        }
        // Draw
        else {
            // Result 오브젝트 내 Background 이미지 오브젝트 배경색 흰색으로 변경
            this.ChangeImageBackgroundColor(this.ResultBackground, this.WhiteColor);
            // 결과 화면이 보이도록 Result 오브젝트 활성화
            this.Result.SetActive(true);
            // Win 오브젝트 대신 Draw 오브젝트가 보이도록 활성화
            this.ResultDraw.SetActive(true);
        }
    }

    /** 승리팀을 인자로 받아 ClientScript의 gameTeamList에서 플레이어의 팀이 승리팀과 일치하는 플레이어의 userId를 반환하는 함수 */
    getWinnerUserId(winTeam) {
        let winnerUserId;
        ClientScript.GetInstance()?.gameTeamList.forEach((gameTeamList, userId) => {
            if (gameTeamList.team == winTeam) {
                winnerUserId = userId
            }
        });
        // userId 반환
        return winnerUserId;
    }

    // ========== 숙제 코드 위치 ==========
    /** 승자의 캐릭터 프로필 썸네일 가져오는 함수 */
    GetThumbnail(userId) {
        ZepetoWorldHelper.GetProfileTexture(userId, (texture: Texture) => {
            const sprite = this.GetSprite(texture);
            this.playerThumbnails.set(userId, sprite);
        }, (error) => {
            console.log(error);
        });
    }

    /** 이미지를 Sprite 형태로 변환해주는 함수 */
    GetSprite(texture: Texture) {
        const rect: Rect = new Rect(0, 0, texture.width, texture.height);
        return Sprite.Create(texture as Texture2D, rect, new Vector2(0.5, 0.5));
    }

    /** 이미지의 배경색을 변경해주는 함수 */
    ChangeImageBackgroundColor(imageObject: Image, color: Color) {
        imageObject.color = color;
    }

}