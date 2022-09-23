import { Collider } from 'UnityEngine';
import { RoomData } from 'ZEPETO.Multiplay';
import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import ClientScript from './ClientScript';
import { MultiplayMessageType } from './MultiplayMessage';
import Ground from './Ground';



/** 
    그라운드의 트리거 객체 입니다. 물리 이벤트를 감지하여 Ground 에게 전달합니다.
    캐릭터 컨트롤러의 트리거링을 위하여 y 축 포지션이 2로 설정됩니다.
*/
export default class GroundTrigger extends ZepetoScriptBehaviour {


    
    /* Ground */

    private ground: Ground;

    /** 자기 자신(현재 이 GroundManager 스크립트가 연결된 오브젝트)의 부모 오브젝트 중 Ground 컴포넌트를 가지고 있는 오브젝트 별도로 저장(캐싱)하는 함수 */
    private InitializeGround() {
        this.ground = this.GetComponentInParent<Ground>();
    }



    /* Unity Event */

    Start() {
        this.InitializeGround();
    }

    OnTriggerEnter(coll: Collider) {

        // 충돌체(캐릭터)의 이름으로 GetTeam
        const myTeam = ClientScript.GetInstance()?.GetTeam(coll.gameObject.name);

        // groundType 가져오기
        const groundType = this.ground.GetType();

        // 메세지 생성
        const message = new RoomData();
        message.Add("team", myTeam);
        message.Add("groundName", this.transform.parent.name);
        message.Add("groundType", groundType);

        // 내가 밟았던 ground가 아니라면
        if (groundType != myTeam) {
            const clientScript = ClientScript.GetInstance();
            // 색 변경 요청 메세지 보내기
            clientScript.multiplayRoom.Send(MultiplayMessageType.ChangeGroundColor, message.GetObject());
        }
    }
}