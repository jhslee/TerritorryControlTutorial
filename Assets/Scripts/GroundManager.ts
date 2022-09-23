import { Debug, GameObject, Material } from 'UnityEngine'
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import Ground from './Ground';



/**
    그라운드를 총괄하는 클래스 입니다.
    사전에 구성된 그라운드 정보를 핸들링하고 있으며
    그라운드의 현재 상태를 추적하여 게임 마지막에 결과를 도출해 냅니다.
 */
export default class GroundManager extends ZepetoScriptBehaviour {



    /* Unity Event */

    Start() {
        this.InitializeGround();
    }



    /* Singleton */

    /** GroundManager 클래스가 담겨있는 인스턴스 */
    private static instance: GroundManager;

    /** GroundManager의 함수나 변수에 접근할 수 있도록 인스턴스를 반환해줄 함수 */
    static GetInstance(): GroundManager {
        if (!GroundManager.instance) {
            const targetObj = GameObject.Find("Ground Manager");
            if (targetObj) GroundManager.instance = targetObj.GetComponent<GroundManager>();
        }
        return GroundManager.instance;
    }



    /* Ground Material */

    /** None 상태의 메테리얼 */
    materialNone: Material;

    /** Red 상태의 메테리얼 */
    materialRed: Material;

    /** Purple 상태의 메테리얼 */
    materialPurple: Material;



    /* Ground */

    /** 보유한 모든 그라운드들의 게임오브젝트 배열 */
    groundListGameObject: GameObject[] = [];

    /** 보유한 모든 그라운드들의 배열 */
    public groundList: Ground[] = [];

    /** Ground Manager 오브젝트에 연결되어있는 64개의 Ground 오브젝트들의 Ground 스크립트 컴포넌트를 별도로 저장(캐싱)하는 함수 */
    private InitializeGround() {
        this.groundList = [];
        //this.groundList = [];
        // GroundListGameObject 에서 Ground 컴포넌트(스크립트)를 추출하여 저장해둠
        const count = this.groundListGameObject.length;
        for (let i = 0; i < count; i++) {
            this.groundList[i] = this.groundListGameObject[i].GetComponent<Ground>();
        }
    }

    /** 모든 그라운드를 초기상태로 리셋합니다. */
    ResetGround() {
        this.groundList.forEach(g => g.SetType(0));
    }
}