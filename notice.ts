const NEW_HOST = "kusa-image.swfz.dev";

// 移転先を案内する文言。旧サービスの画像の凡例の行の左側に描く
const movedNotice = (user: string): string => `Moved -> ${NEW_HOST}/${user}`;

export { movedNotice };
