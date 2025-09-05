//スライダの装飾用
document.addEventListener("DOMContentLoaded", () => {
  // 'slider-container'クラスを持つすべての要素を取得
  const sliderContainers = document.querySelectorAll(".slider-wrapper");

  // 各スライダーコンテナに対して処理を実行
  sliderContainers.forEach((container) => {
    // コンテナ内の必要な要素を取得
    const slider = container.querySelector(".slider");
    const progress = container.querySelector(".slider-progress");
    // const tooltip = container.querySelector(".slider-tooltip");

    // スライダーの見た目を更新する関数
    function updateSliderAppearance() {
      const value = slider.value;
      const min = slider.min;
      const max = slider.max;
      // 値をパーセンテージに変換
      const percentage = ((value - min) / (max - min)) * 100;

      // プログレスバーの幅を更新
      progress.style.width = percentage + "%";
    }

    // ページ読み込み時に初期値を設定
    updateSliderAppearance();

    // スライダーが操作されたら、リアルタイムで見た目を更新
    slider.addEventListener("input", updateSliderAppearance);
  });
});

document.addEventListener("DOMContentLoaded", function () {
  // 新しい親コンテナ '.slider-container' を基準にループ処理
  document.querySelectorAll(".slider-container").forEach((container) => {
    // 現在のコンテナ内にある各要素を取得
    const slider = container.querySelector(".slider");
    const sliderProgress = container.querySelector(".slider-progress");
    const sliderValue = container.querySelector(".slider-value"); // ラッパーの兄弟要素になった

    // 必要な要素が揃っていない場合はスキップ
    if (!slider || !sliderProgress || !sliderValue) {
      return;
    }

    // スライダーの状態を更新する関数（計算ロジックは変更なし）
    const updateSlider = () => {
      const trackWidth = slider.offsetWidth;
      const thumbWidth = 24; // CSSで定義したつまみの幅

      const value = parseFloat(slider.value);
      const min = parseFloat(slider.min);
      const max = parseFloat(slider.max);
      const range = max - min;

      const valuePercent = range === 0 ? 0 : (value - min) / range;

      const progressWidthPx =
        valuePercent * (trackWidth - thumbWidth) + thumbWidth / 2;

      // スタイルとテキストを更新
      sliderProgress.style.width = `${progressWidthPx}px`;
      sliderValue.textContent = slider.value;
    };

    // 初期表示とイベントリスナーの設定
    updateSlider();
    slider.addEventListener("input", updateSlider);
    window.addEventListener("resize", updateSlider);
  });
});
