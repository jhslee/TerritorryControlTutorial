import { ZepetoScriptBehaviour } from 'ZEPETO.Script'
import { SpawnInfo, ZepetoPlayers, LocalPlayer, ZepetoCharacter } from 
'ZEPETO.Character.Controller'
import { State } from 'ZEPETO.Multiplay.Schema';
 
export default class ClientStarter extends ZepetoScriptBehaviour {
   Start() {   
    console.error("in start"); 
       ZepetoPlayers.instance.CreatePlayerWithZepetoId("", "[ZEPETO_ID]", new SpawnInfo(), true);
 
       ZepetoPlayers.instance.OnAddedLocalPlayer.AddListener(() => {
           let _player : LocalPlayer = ZepetoPlayers.instance.LocalPlayer;
       });
   }
}