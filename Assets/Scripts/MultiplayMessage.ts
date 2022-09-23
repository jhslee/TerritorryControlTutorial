/** 클라이언트와의 메시지 통신 정의 */
export enum MultiplayMessageType {

    /** Waiting 상태 진입 메시지 */
    Waiting = "Waiting",

    /** GameReady 메시지 */
    GameReady = "GameReady",

    /** GameStart 상태 진입 메시지 */
    GameStart = "GameStart",

    /** GameFinish 메세지 */
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
export type MultiplayMessageCharacterTransform = {

    /** 포지션 정보 */
    positionX: number,
    positionY: number,
    positionZ: number,
}

/** 메시지 내용 정의 (CharacterState) */
export type MultiplayMessageCharacterState = {

    /** CharacterState 정보 */
    characterState: number
}

// ========== 추가
/** Ground Color 변경 메세지 정의 */
export type MultiplayMessageChangeGroundColor = {
    /** 기존 ground 색 */
    groundType: number,
    /** 밟은 팀 */
    team: number,
    /** 밟힌 ground 이름 */
    groundName: string,
}
// ========== 추가