import { MeshRenderer } from 'UnityEngine';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import GroundManager from './GroundManager';



/** 그라운드의 타입 정의 */
enum GroundType { None, Red, Purple }



/** 그라운드 객체 클래스 입니다. */
export default class Ground extends ZepetoScriptBehaviour {



    /* Unity Event */

    // Awake() 함수는 기본 제공 함수로, Start() 함수들보다 먼저 실행되는 특징을 가지고 있음.
    // ClientScript의 Start() 함수에서 renderer 변수를 참조(접근)하는데, 이 때 변수가 비어있으면 게임 실행에 문제가 되기 때문에 InitializeRenderer() 함수 내에 있는 this.renderer는 ClientScript의 Start() 함수에서 참조하기 전에 내용을 넣어주어야 함.
    Awake() {
        this.InitializeRenderer();
    }



    /* Ground Type */

    /** 그라운드의 타입 */
    groundType: GroundType = GroundType.None;

    /** 그라운드의 타입을 설정하는 함수 */
    SetType(groundType: GroundType) {

        // 그라운드 타입에 따른 분기 설정 진행
        switch (groundType) {
            case GroundType.None:
                this.renderer.sharedMaterial = GroundManager.GetInstance().materialNone;
                break;
            case GroundType.Red:
                this.renderer.sharedMaterial = GroundManager.GetInstance().materialRed;
                break;
            case GroundType.Purple:
                this.renderer.sharedMaterial = GroundManager.GetInstance().materialPurple;
                break;
        }

        // 타입 갱신
        this.groundType = groundType;
    }

    // ========== 추가
    /** 자기 자신(현재 이 Ground 스크립트가 연결된 오브젝트)의 Type 번호(차지한 팀 번호)를 반환해주는 함수 */
    GetType() {
        const groundManager = GroundManager.GetInstance();
        switch (this.renderer.sharedMaterial) {
            case groundManager.materialRed:
                return GroundType.Red;
            case groundManager.materialPurple:
                return GroundType.Purple;
            case groundManager.materialNone:
                return GroundType.None;
        }
    }
    // ========== 추가



    /* Renderer */

    /** 그라운드의 랜더러 입니다. (MeshRenderer) */
    public renderer: MeshRenderer;

    /** renderer 변수에 자기 자신의 MeshRenderer(Inspector 창에서 볼 수 있는 컴포넌트)를 가져와 변수에 저장하는 함수 */
    private InitializeRenderer() {
        this.renderer = this.gameObject.GetComponent<MeshRenderer>();
    }
}