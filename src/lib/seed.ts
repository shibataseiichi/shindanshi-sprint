import type { Question } from "./types";

export const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "original-econ-001", stage: 1, subject: "経済学・経済政策", topic: "ミクロ経済学", subtopic: "需要の価格弾力性", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "ある商品の価格を10%上げたところ需要量が15%減少した。他の条件が一定のとき、需要の価格弾力性（絶対値）として最も近いものはどれか。",
    choices: ["0.5", "0.67", "1.0", "1.5"], answer: 3, explanation: "価格弾力性は需要量の変化率÷価格の変化率なので、15%÷10%=1.5です。", tags: ["計算", "基礎"],
  },
  {
    id: "original-fin-001", stage: 1, subject: "財務・会計", topic: "財務諸表", subtopic: "損益分岐点", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "固定費が300万円、限界利益率が30%の企業の損益分岐点売上高はいくらか。",
    choices: ["90万円", "900万円", "1,000万円", "3,000万円"], answer: 2, explanation: "損益分岐点売上高=固定費÷限界利益率=300万円÷0.3=1,000万円です。", tags: ["計算", "CVP"],
  },
  {
    id: "original-str-001", stage: 1, subject: "企業経営理論", topic: "経営戦略", subtopic: "VRIO", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "VRIO分析で、持続的競争優位に必要な4つの観点に含まれないものはどれか。",
    choices: ["経済的価値", "希少性", "模倣困難性", "市場成長率"], answer: 3, explanation: "VRIOはValue、Rarity、Imitability、Organizationの4観点です。", tags: ["戦略", "基礎"],
  },
  {
    id: "original-ops-001", stage: 1, subject: "運営管理", topic: "生産管理", subtopic: "ラインバランシング", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "各工程の作業時間合計が240秒、工程数が4、サイクルタイムが75秒のとき、ライン編成効率は何%か。",
    choices: ["60%", "75%", "80%", "90%"], answer: 2, explanation: "240÷(4×75)=0.8なので80%です。", tags: ["計算", "生産管理"],
  },
  {
    id: "original-law-001", stage: 1, subject: "経営法務", topic: "会社法", subtopic: "株式会社", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "株式会社の機関として、すべての株式会社に必ず設置されるものはどれか。",
    choices: ["取締役会", "監査役", "会計監査人", "株主総会"], answer: 3, explanation: "株主総会と取締役はすべての株式会社に必要です。選択肢では株主総会が該当します。", tags: ["会社法", "基礎"],
  },
  {
    id: "original-it-001", stage: 1, subject: "経営情報システム", topic: "ネットワーク", subtopic: "プロトコル", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "Web通信を暗号化するため、HTTPをTLS上で利用するプロトコルはどれか。",
    choices: ["FTP", "HTTPS", "SMTP", "SNMP"], answer: 1, explanation: "HTTPSはHTTP over TLSで、通信内容の暗号化などを提供します。", tags: ["ネットワーク", "基礎"],
  },
  {
    id: "original-sme-001", stage: 1, subject: "中小企業経営・政策", topic: "中小企業政策", subtopic: "支援機関", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "中小企業者の経営相談に応じる地域の身近な支援機関として最も適切なものはどれか。",
    choices: ["商工会・商工会議所", "日本銀行", "最高裁判所", "証券取引所"], answer: 0, explanation: "商工会・商工会議所は地域の中小企業・小規模事業者への経営支援を行います。", tags: ["政策", "基礎"],
  },
  {
    id: "original-fin-002", stage: 1, subject: "財務・会計", topic: "投資評価", subtopic: "正味現在価値", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "正味現在価値（NPV）法で、独立した投資案を採択する基本的な基準はどれか。",
    choices: ["NPVが0より大きい", "NPVが0より小さい", "回収期間が常に1年未満", "会計利益が0"], answer: 0, explanation: "NPVが正なら、要求収益率を上回る価値を生むため採択対象です。", tags: ["投資評価", "理論"],
  },
  {
    id: "original-str-002", stage: 1, subject: "企業経営理論", topic: "組織論", subtopic: "動機づけ", year: 2027,
    source: "診断士 Sprint オリジナル", license: "CC BY 4.0", question: "ハーズバーグの二要因理論で、達成や承認はどちらに分類されるか。",
    choices: ["衛生要因", "動機づけ要因", "外部環境要因", "統制要因"], answer: 1, explanation: "達成、承認、仕事そのものなどは満足を高める動機づけ要因です。", tags: ["組織論", "基礎"],
  }
];
