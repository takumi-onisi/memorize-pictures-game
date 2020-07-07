window.addEventListener('load', init, false);

//インプットタグの中でチェックされた要素だけに特定のCSSを適用する
function addCssClassToCheckedElements(elems, cssClass) {
  for (let i = 0; i < elems.length; i++) {
    if (elems[i].checked) {
      elems[i].parentNode.classList.add(cssClass);
    } else {
      elems[i].parentNode.classList.remove(cssClass);
    }
  }
}



//ゲームの画面やフォントサイズをブラウザのスクリーンサイズによって変更する
function adjust() {

  const display = document.getElementById("display");

  //画面のサイズに応じてゲーム要素の横幅を変更する。
  if (window.parent.screen.width <= 600) {

    document.getElementById("game").style.width = 100 + "%";

    //ディスプレイの高さを調整
    let display_height = display.clientWidth;
    display.style.height = display_height * 3 / 4 + "px";

    //フォントサイズの調整
    document.body.style.fontSize = "40px";
    document.getElementById("gameTitle").style.fontSize = "56px";
    const tagInput = document.getElementsByTagName("input");

    for (i = 0; i < tagInput.length; i++) {
      tagInput[i].style.fontSize = "40px";
    }

  }

}




//ディスプレイの高さを取得して、表示させたい要素をディスプレイの垂直方向中央に配置する。
function fix_center(elem) {

  if (!(elem.clientHeight) || !(elem.clientWidth)) {

    console.log(elem + "の要素の幅高さが取得できません")
    return
  }

  const display = document.getElementById("display");


  elem.style.top = Math.floor(display.clientHeight / 2) - Math.floor(elem.clientHeight / 2) + "px";
  elem.style.left = Math.floor(display.clientWidth / 2) - Math.floor(elem.clientWidth / 2) + "px";
}

// ゲームの画面に表示されるメッセージを消す
function clearMessageArea() {
  const display = document.getElementById("display");
  const MessageAreas = display.getElementsByClassName("MessageArea");
  for (let i = 0; i < MessageAreas.length; i++) {
    MessageAreas[i].classList.add("hidden");
  }

}



//Gameクラスでゲームに関する変数と関数をまとめて管理
class Game {
  constructor() {
    this.result = 0; //正解が入る 
    this.pic = [];
    this.picNum = [];
    this.level = 0;
    this.repetition = 0;
  }

  gameStart(imageFiles) {
    //ゲームのメイン画面に移動
    document.getElementById("display").scrollIntoView();

    //ゲームの画像がすべて表示されるまでスタートボタンが押されないようにする
    btnStart.classList.add('pointerEventsNone');



    //ランダムにimageFilesから画像を２つ抽出pic[0],pic[1]に格納するために異なる２つの要素の番号を生成しrandomNumber0,randomNumberBに代入
    const randomNumber = function () {
      return Math.floor(Math.random() * imageFiles.length);
    }
    let randomNumberA = randomNumber();
    let randomNumberB = randomNumber();

    // randomNumberA,randomNumberBに入る数が被らないようにする
    while (randomNumberA === randomNumberB) {
      randomNumberB = randomNumber()
    }


    // ランダムに生成した数字が入るrandomNumber0,randomNumberBを使ってimageFilesからランダムに要素を取得
    this.pic[0] = new Image();
    this.pic[1] = new Image();
    this.pic[0].src = "./images/" + imageFiles[randomNumberA].name;
    this.pic[1].src = "./images/" + imageFiles[randomNumberB].name;
    this.pic[0].alt = imageFiles[randomNumberA].alt;
    this.pic[1].alt = imageFiles[randomNumberB].alt;

    //ボタンの画像の要素を取得
    const btn0Image = document.getElementById("imgBtn0");
    const btn1Image = document.getElementById("imgBtn1");
    // const btn0Image = document.getElementById("dog");
    // const btn1Image = document.getElementById("cat");

    // ボタンの画像をランダムに選ばれた画像に変更する
    btn0Image.src = "./images/" + imageFiles[randomNumberA].name;
    btn1Image.src = "./images/" + imageFiles[randomNumberB].name;



    //ボタンの画像のalt属性も選ばれた画像のものに変更する
    btn0Image.alt = imageFiles[randomNumberA].alt;
    btn1Image.alt = imageFiles[randomNumberB].alt;



    // 今出ているメッセージをすべて隠す
    clearMessageArea();


    //ゲームのレベルを設定する
    const MessageGameLevel = document.getElementById("MessageGameLevel");
    this.repetition = 0; //画像を表示する回数を初期化
    let gamelevelParameters = document.getElementsByName("gameLevelParameter");

    for (let i = 0; i < gamelevelParameters.length; i++) {
      if (gamelevelParameters[i].checked) {
        this.level = parseInt(gamelevelParameters[i].value);
        document.getElementById("levelText").innerHTML = "Level-" + this.level;
        // ゲームのレベルに応じて画像の表示回数を調整する
        this.repetition = this.level + 2;
        break
      }
    }
    if (this.repetition == 0) {
      alert("ゲームのレベルを設定してください")
    }

    // ランダムに０か１を画像番号に入れる。番号は画像の表示回数分だけ用意する
    this.picNum = []; //初期化する
    for (let i = 0; i < this.repetition; i++) {

      this.picNum[i] = Math.floor(Math.random() * 2);
    }


    //levelを画面に表示
    MessageGameLevel.classList.remove("hidden");
    fix_center(MessageGameLevel);

    // 答えを入れた変数を初期化
    this.result = "";
    let self = this;
    // 画像をスライドショーのように表示させる
    const slideShow = new SlideShow();
    setTimeout(function () {
      MessageGameLevel.classList.add("hidden");
      slideShow.slideShow(self);
    }, 1500)


    //gameStart()閉じ
  }

}//class Game閉じ


//ゲームの画面を切り替えるためのクラス
class SlideShow {
  constructor() {
    this.count = 0;
    this.flag = 0;
    this.interval = 1000;
  }

  //主にメインイメージの画像を消すか表示させる関数
  slideShow(game) {

    //ゲームのレベルに応じて画像を切り替える時間を調整する
    this.interval = 1000 - game.level * 100;

    const image0 = window.document.getElementById("mainImage");

    if (this.count < game.picNum.length) {
      // フラッグが０のときは１を、それ以外１のときは０を入れる
      this.flag = (this.flag == 0) ? 1 : 0;

      //フラッグが０のときは画像を消す
      if (this.flag == 0) {
        // 画像を消す処理
        image0.classList.add('fade');
        setTimeout((function () { this.slideShow(game) }).bind(this), (this.interval > 500) ? this.interval : 500);
      } else if (this.flag == 1) {
        //フラッグが１のときは画像を表示し、変数resultに表示している画像のオルト属性を入れる
        // 画像を表示する際の処理
        image0.src = game.pic[game.picNum[this.count]].src;
        image0.classList.remove('fade');
        game.result += game.pic[game.picNum[this.count]].alt + " ";


        //カウントを０から増やしていって配列を順番に移動していくcountは表示する配列の添え字に対応している。
        this.count++;
        // カウントが用意した配列の数に達するまで繰り返される
        setTimeout((function () { this.slideShow(game) }).bind(this), this.interval);
      }


    } else {
      //再帰による繰り返し処理の終わり
      //画像がすべて表示された後の処理


      //最後に表示された画像を消す
      image0.classList.add('fade');
      //解答を促すメッセージを表示
      const MessageAnswerTime = document.getElementById("MessageAnswerTime");
      MessageAnswerTime.classList.remove('hidden');
      //表示したメッセージがdisplayの中央に来るようにする。
      fix_center(MessageAnswerTime);

      //回答ボタンを押せるようにする
      const btn0 = document.getElementById("btn0");
      const btn1 = document.getElementById("btn1");
      btn0.classList.remove('pointerEventsNone');
      btn1.classList.remove('pointerEventsNone');

      //回答ボタンまで画面をスクロールさせる
      const ansBtnArea = document.getElementById("ansBtnArea");
      window.setTimeout(
        (ansBtnArea) => {
          ansBtnArea.scrollIntoView();
        }
        , 1500
        , ansBtnArea
      )

    }

  }//slideShow　閉じかっこ
}




//ゲームのプレイヤーが答えを入力していく段階の処理を扱うクラス
class AnswerPhase {
  constructor() {
    this.answer = "";
  }

  //ゲームのプレイヤーが解答ボタンを押した際の処理
  response(event, game) {


    //押した回答ボタンのオルト属性を追加していく。
    this.answer += event.target.alt + " ";
    document.getElementById("ansText").innerHTML = this.answer;



    //ボタン要素取得
    const btn0 = document.getElementById("btn0");
    const btn1 = document.getElementById("btn1");

    //解答ボタンが押されるたびに正解かどうかを判定する
    //答えが正解の時
    if (game.result === this.answer) {

      //答えを初期化
      this.answer = "";

      // 現在表示されている画像を非表示にする
      MessageAnswerTime.classList.add('hidden');

      //表示したメッセージがdisplayの中央に来るようにする。
      //正解のメッセージを表示
      var MessageCorect = document.getElementById("MessageCorrect");
      MessageCorect.classList.remove('hidden');
      fix_center(MessageCorect);

      //ゲームのメイン画面に移動
      document.getElementById("display").scrollIntoView();

      // 回答ボタンを押せなくする
      btn0.classList.add('pointerEventsNone');
      btn1.classList.add('pointerEventsNone');
      //スタートボタンを押せるようにする
      const btnStart = document.getElementById("btnStart");
      btnStart.classList.remove('pointerEventsNone');

      //最大レベルより小さい場合ゲームのレベルを一段階上げる
      //1 < game.level < gameLevelParameter.length である
      const gameLevelParameter = document.getElementsByName("gameLevelParameter")
      if (game.level < gameLevelParameter.length) {
        gameLevelParameter[game.level].checked = true;
      }
      //レベルのボタンの背景を変更する
      const gameLevelParameters = document.getElementById("gameLevelParameters");
      gameLevelParameters.click();

    }

    //答えが不正解の時
    //回答ボタンを押した回数がゲームの答えを越えてしまった場合もしくは同じであっても答えが異なる場合
    if ((this.answer.length === game.result.length && game.result !== this.answer) ||
      this.answer.length > game.result.length) {


      //答えを初期化
      this.answer = "";

      //現在表示されている画像を非表示にする
      MessageAnswerTime.classList.add('hidden');

      //不正解のメッセージを表示
      const MessageNotCorect = document.getElementById("MessageNotCorrect");
      MessageNotCorect.classList.remove('hidden');
      //表示したメッセージがdisplayの中央に来るようにする。
      fix_center(MessageNotCorect);

      //ゲームのメイン画面に移動
      document.getElementById("display").scrollIntoView();

      // 回答ボタンを押せなくする
      btn0.classList.add('pointerEventsNone');
      btn1.classList.add('pointerEventsNone');
      //スタートボタンを押せるようにする
      const btnStart = document.getElementById("btnStart");
      btnStart.classList.remove('pointerEventsNone');

    }

  }//function response閉じ

  //回答者の答えをリセットする
  reset() {
    document.getElementById("ansText").innerHTML = "";
    this.answer = "";
  }
}//class AnswerPhase　閉じ


//画像ファイルのクラスを作る
class Img {
  constructor(file_Name, alt) {
    this.name = file_Name;
    this.alt = alt
  }
}



function init() {

  const game = new Game();

  const answerPhase = new AnswerPhase();

  // コンテンツをブラウザの画面に合わせる。
  adjust();


  //レベルが選択されるとその背景画像が変わるようにする
  const gameLevelParameters = document.getElementById("gameLevelParameters");
  const gameLevelParameter = document.getElementsByName("gameLevelParameter");
  gameLevelParameters.addEventListener("click", function () {
    addCssClassToCheckedElements(gameLevelParameter, "levelBoxChecked");
  })


  // ボタンの要素を取得
  const btnStart = document.getElementById("btnStart");
  const btn0 = document.getElementById("btn0");
  const btn1 = document.getElementById("btn1");


  //メッセージの要素を取得し、メッセージの垂直方向の位置を中央に固定する
  const MessageAboutGame = document.getElementById("MessageAboutGame");
  fix_center(MessageAboutGame);




  //画像ファイルを入れる配列imageFilesには、表示させたい画像のファイル名（第1引数）とalt属性（第2引数）が格納される
  const imageFiles = [new Img("dog.jpg", "イヌ"), new Img("cat.jpg", "ネコ"), new Img("turtle.jpg", "カメ"),]



  // 切り替える画像画面の要素を取得
  const image0 = window.document.getElementById("mainImage");
  image0.addEventListener("load", () => {
    fix_center(image0);
  });




  //スタートボタンを押すとゲームが始まる
  btnStart.addEventListener('click', function () {
    answerPhase.reset();
    game.gameStart(imageFiles)
  }, false);



  //ボタンを押すと回答が入力されていく。ボタンを押すことでそれぞれのボタンに対応した答えが入力される。
  btn0.addEventListener('click', function () {
    answerPhase.response(event, game);
  }, false);

  btn1.addEventListener('click', function () {
    answerPhase.response(event, game);
  }, false);



  //解答者が入力した解答をリセットする
  var btnReset = document.getElementById("btnReset");
  btnReset.addEventListener('click', function () { answerPhase.reset() }, false);

  //init閉じ
}

