<template>
    <div class="snack_bg">
        <div class="w1440 noScroll">
            <div class="row site">
                <div
                    class="sm-12 md-3 col sidebar"
                    v-first="{name:'translateLeft',duration:'0.5s',delay:'0.5s',offset:'0'}"
                >
                    <div class="paper">
                        <h3
                            class="sidebar-title sidebar_h3"
                            v-first="{name:'translateTop',duration:'0.5s',delay:'0.8s',offset:'0'}"
                        >贪恰蛇 Gluttonous Snake</h3>
                        <div class="row">
                            <div
                                class="collapsible full-width"
                                v-for="(item,idx) in sidebar"
                                :key="idx"
                                v-first="{name:'translateTop',duration:'0.5s',delay:`${1+idx*0.2}s`,offset:'0'}"
                            >
                                <input
                                    :id="`collapsible-${item.title}`"
                                    type="radio"
                                    name="collapsible"
                                >
                                <label :for="`collapsible-${item.title}`">{{item.title}}</label>
                                <div class="collapsible-body">
                                    <ul>
                                        <li
                                            class="paper_li"
                                            v-for="(child,cIdx) in item.children"
                                            :key="cIdx"
                                            @click="sideBarMethod(child)"
                                        >{{child.label}}</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    class="sm-12 md-9 col"
                    v-first="{name:'translateRight',duration:'0.5s',delay:'0.8s',offset:'0'}"
                >
                    <div class="paper score_father">
                        <div class="row child-borders cont_btn">
                            <span
                                class="paper-btn"
                                v-for="(item,idx) in buttonList"
                                :key="idx"
                                @click="switchEvent(item)"
                                v-first="{name:'translateTop',duration:'0.5s',delay:`${1+idx*0.2}s`,offset:'0'}"
                            >{{item.label}}</span>
                        </div>
                        <div
                            class="content"
                            v-first="{name:'translateTop',duration:'0.5s',delay:`${1+buttonList.length*0.2}s`,offset:'0'}"
                        >
                            <div
                                class="layout"
                                ref="layout"
                            >
                                <ul
                                    class="check_ul cl"
                                    v-for="(col,cIdx) in formattCheck"
                                    :key="cIdx"
                                >
                                    <li
                                        v-for="(row,rIdx) in col"
                                        :key="rIdx"
                                        :style="handleLiStyle"
                                        :ref="`li_${cIdx}`"
                                    ></li>
                                </ul>
                            </div>
                            <transition name="alan_scale">
                                <div
                                    class="stop"
                                    v-show="isStop"
                                >
                                    <img
                                        src="../../assets/img/snack/stop.png"
                                        alt=""
                                    >
                                </div>
                            </transition>
                        </div>
                        <div
                            class="score"
                            v-first="{name:'translateTop',duration:'0.5s',delay:'1.9s',offset:'0'}"
                        >
                            <div>{{`当前得分：${score}分`}}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { sidebar, buttonList } from "../../const/snack";
import { COMMIT } from "../../utils";
import { $animate } from "../../mixins";
export default {
    inject: ["reload"],
    mixins: [$animate],
    data() {
        return {
            checkerArea: [50, 50], //棋盘横纵格子数
            currentMode: "classicMode", //当前游戏魔模式
            sidebar, //侧边栏
            buttonList, //按钮栏
            liStyle: {}, //棋盘样式
            snackLength: 4, //蛇的初始长度
            boardBorder: true, //棋盘边框
            snack: [], //蛇的容器
            food: [], //食物的坐标
            direction: undefined, //移动方向
            moveTimer: undefined, //蛇移动的定时器
            isStop: true, //是否暂停
            wait: true, //等待方向更改完成才能再次修改方向
            speed: 200, //蛇速度
            score: 0 //当前得分
        };
    },
    computed: {
        /**
         * 二维数组
         * @return {array}
         */
        formattCheck() {
            const [a, b] = this.checkerArea;
            const res = [];
            for (let i = 0; i < a; i++) {
                const arr = [];
                for (let n = 0; n < b; n++) {
                    arr[n] = n;
                }
                res[i] = arr;
            }
            return res;
        },

        /**
         * 棋盘样式
         * @return {object}
         */
        handleLiStyle() {
            let { liStyle, boardBorder } = this;
            const border = "1px solid #aaa";
            if (boardBorder) {
                liStyle = { ...liStyle, border };
            }
            return liStyle;
        }
    },
    created() {
        //1.0 生成蛇的二维数组
        this.createSnack();
        this.$nextTick(() => {
            //2.0 初始化棋盘样式
            this.initStyle();
            //3.0 画出一条蛇
            this.drawSnack();
            //4.0 随机生成食物
            this.createFood();
            //5.0 绑定键盘事件
            this.bindKeycode();
        });
    },
    destroyed() {
        clearInterval(this.moveTimer);
    },
    methods: {
        /**
         * 侧边栏事件
         * @param {object}
         * @return {void}
         */
        sideBarMethod(item) {
            const { type } = item;
            switch (type) {
                case "board":
                    this.chooseBoard(item);
                    break;
                case "difficulty":
                    this.chooseDifficulty(item);
                    break;
                case "mode":
                    this.chooseMode(item);
                    break;
            }
        },

        /**
         * 选择模式
         * @param {object}
         * @return {void}
         */
        chooseMode({ type, mode, label }) {
            let tip = `已切换为${label}`;
            let alertType = "success";
            switch (mode) {
                case "classicMode":
                    this.currentMode = mode;
                    break;
                case "freeMode":
                    this.currentMode = mode;
                    break;
                case "adventureMode":
                    tip = `暂未开放`;
                    alertType = "warning";
                    break;
            }
            this.restartGame();
            this.HiAlert({
                type: alertType,
                content: tip
            });
        },

        /**
         * 选择难度
         * @param {object}
         * @return {void}
         */
        chooseDifficulty({ speed, label }) {
            let type = "";
            switch (speed) {
                case "normal":
                    this.speed = 80;
                    type = "primary";
                    break;
                case "hard":
                    this.speed = 60;
                    type = "warning";
                    break;
                case "crazy":
                    this.speed = 30;
                    type = "danger";
                    break;
            }
            this.isStop = true;
            clearInterval(this.moveTimer);
            this.HiAlert({
                type,
                content: `难度已切换为${label}`
            });
        },

        /**
         * 选择棋盘size
         * @param {object}
         * @return {void}
         */
        chooseBoard({ size, label }) {
            switch (size) {
                case "twenty":
                    this.checkerArea = [20, 20];
                    break;
                case "fifty":
                    this.checkerArea = [50, 50];
                    break;
                case "seventy":
                    this.checkerArea = [70, 70];
                    break;
                case "hundred":
                    this.checkerArea = [100, 100];
                    break;
                case "border":
                    this.boardBorder = !this.boardBorder;
                    return;
            }
            this.HiAlert({
                type: "success",
                content: `棋盘已设置为${label}`
            });
            this.initStyle();
            this.restartGame();
        },

        /**
         * 按钮事件
         * @param {null}
         * @return {void}
         */
        snackAlert() {
            this.HiAlert({
                type: "warning",
                content: "This is just a test button"
            });
        },

        /**
         * 按钮事件
         * @param {object}
         * @return {void}
         */
        switchEvent({ type }) {
            switch (type) {
                case "restart":
                    this.restartGame();
                    this.HiAlert({
                        type: "success",
                        content: "游戏已重置！"
                    });
                    break;
                case "stop":
                    this.stopGame();
                    break;
                case "alert":
                    this.snackAlert();
                    break;
            }
        },

        /**
         * 暂停游戏
         * @param {null}
         * @return {void}
         */
        stopGame() {
            const { isStop } = this;
            if (!isStop) {
                clearInterval(this.moveTimer);
                this.HiAlert({
                    type: "secondary",
                    content: "游戏已暂停！",
                    clear: true
                });
            } else {
                this.HiAlert({
                    type: "success",
                    content: "游戏已开始！",
                    clear: true
                });
                this.gameStart();
            }
            this.isStop = !isStop;
        },

        /**
         * 重新开始游戏
         * @param {null}
         * @return {void}
         */
        restartGame() {
            this.score = 0;
            this.isStop = true;
            clearInterval(this.moveTimer);
            //1.0 清空蛇和食物
            const { layout } = this.$refs;
            const liArr = layout.querySelectorAll("li");
            for (let i = 0, l = liArr.length; i < l; i++) {
                const li = liArr[i];
                li.className = "";
            }
            //2.0 生成蛇的二维数组
            this.createSnack();
            //3.0 画出一条蛇
            this.drawSnack();
            //4.0 随机生成食物
            this.createFood();
        },

        /**
         * 游戏开始
         * @param {null}
         * @return {void}
         */
        gameStart() {
            const { speed } = this;
            clearInterval(this.moveTimer);
            this.moveTimer = setInterval(() => {
                this.snackMove();
                this.wait = true;
            }, speed);
        },

        /**
         * 按键改变方向
         * @param {null}
         * @return {void}
         */
        bindKeycode() {
            document.onkeydown = ({ keyCode }) => {
                const { direction, wait } = this;
                //1.0 不等于相反方向时按键改变蛇的方向
                switch (keyCode) {
                    //左
                    case 37:
                        if (direction != "right" && wait) {
                            this.direction = "left";
                            this.wait = false;
                        }
                        break;
                    //上
                    case 38:
                        if (direction != "down" && wait) {
                            this.direction = "up";
                            this.wait = false;
                        }
                        break;
                    //右
                    case 39:
                        if (direction != "left" && wait) {
                            this.direction = "right";
                            this.wait = false;
                        }
                        break;
                    //下
                    case 40:
                        if (direction != "up" && wait) {
                            this.direction = "down";
                            this.wait = false;
                        }
                        break;
                    //空格
                    case 32:
                        this.stopGame();
                        break;
                }
            };
        },

        /**
         * 移动一条蛇
         * @param {null}
         * @return {void}
         */
        snackMove() {
            const { direction, snack, currentMode } = this;
            let [r, c] = snack[0]; //第r行的第c个
            let headAfter = [];
            switch (direction) {
                case "up":
                    headAfter = [r - 1, c];
                    break;
                case "down":
                    headAfter = [r + 1, c];
                    break;
                case "left":
                    headAfter = [r, c - 1];
                    break;
                case "right":
                    headAfter = [r, c + 1];
                    break;
            }
            //判断蛇头是否在自己身上
            if (this.judgeHeadInSelfBody()) {
                this.gameOver();
                return;
            }
            //判断蛇头在当前游戏模式失败则游戏结束
            const res = this[currentMode](headAfter);
            switch (currentMode) {
                //经典模式
                case "classicMode":
                    if (!res) {
                        this.gameOver();
                        return;
                    }
                    break;
                //自由模式
                case "freeMode":
                    headAfter = res;
                    break;
            }
            if (this.isAteFood()) {
                //吃到食物则重新生成一个食物
                this.createFood();
            } else {
                //未到食物则删除获取最后一个元素坐标
                const [row, col] = snack.pop();
                const li = this.$refs[`li_${row}`][col];
                li.className = "";
            }
            snack.unshift(headAfter);
            this.drawSnack();
        },

        /**
         * 经典模式
         * @param {array}
         * @return {boolean}
         */
        classicMode([row, col]) {
            const [R, C] = this.checkerArea;
            if (row < 0 || col < 0 || row == R || col == C) {
                return false;
            } else {
                return true;
            }
        },

        /**
         * 自由模式
         * @param {array}
         * @return {array}
         */
        freeMode([row, col]) {
            let [R, C] = this.checkerArea;
            R -= 1;
            C -= 1;
            let snackHead = [row, col];
            //蛇头到达上边界时 蛇头坐标变为棋盘下边界
            if (row < 0) {
                snackHead = [R, col];
            }
            //蛇头到达左边界时 蛇头坐标变为棋盘右边界
            if (col < 0) {
                snackHead = [row, C];
            }
            //蛇头到达下边界时 蛇头坐标变为棋盘上边界
            if (row > R) {
                snackHead = [0, col];
            }
            //蛇头到达右边界时 蛇头坐标变为棋盘左边界
            if (col > C) {
                snackHead = [row, 0];
            }
            return snackHead;
        },

        /**
         * 冒险模式
         * @param {array}
         * @return {array}
         */

        /**
         * 游戏结束
         * @param {null}
         * @return {void}
         */
        gameOver() {
            clearInterval(this.moveTimer);
            this.score = 0;
            this.restartGame();
            this.HiAlert({
                type: "danger",
                content: "游戏结束！"
            });
            this.HiImg({ type: "fail" });
        },

        /**
         * 判断是否吃到了食物
         * @param {null}
         * @return {void}
         */
        isAteFood() {
            const [foodRow, foodCol] = this.food;
            const [headRow, headCol] = this.snack[0];
            if (foodRow == headRow && foodCol == headCol) {
                this.score++;
                return true;
            } else {
                return false;
            }
        },

        /**
         * 创建一条蛇
         * @param {null}
         * @return {void}
         */
        createSnack() {
            const {
                snackLength: l,
                checkerArea: [r, c]
            } = this;
            //1.0 避免随机头部在边界且容的下蛇的长度
            const row = ~~(Math.random() * (r - l - 1) + 1);
            const col = ~~(Math.random() * (c - l - 1) + 1);
            //2.0 头部坐标
            const head = [row, col];
            const body = [];
            //3.0 随机生成蛇
            const ran = Math.random();
            if (ran > 0.5) {
                for (let i = row + 1; i < row + l; i++) {
                    body.push([i, col]);
                    //4.0 定义蛇移动的方向
                    this.direction = "up";
                }
            } else {
                for (let i = col + 1; i < col + l; i++) {
                    body.push([row, i]);
                    this.direction = "left";
                }
            }
            this.snack = [head, ...body];
        },

        /**
         * 画一条蛇
         * @param {null}
         * @return {void}
         */
        drawSnack() {
            const { snack } = this;
            //1.0 解构 a:横轴坐标 b:纵轴坐标
            snack.map(([a, b], idx) => {
                //2.0 根据坐标获取元素
                const li = this.$refs[`li_${a}`][b] || undefined;
                if (!li) {
                    return;
                }
                if (idx == 0) {
                    li.className = "snack_head";
                } else {
                    li.className = "snack_body";
                }
            });
        },

        /**
         * 创建一个食物
         * @param {null}
         * @return {void}
         */
        createFood() {
            const {
                checkerArea: [x, y],
                snack
            } = this;
            //1.0 食物的坐标与蛇重叠则重新随机
            while (true) {
                const row = Math.floor(Math.random() * x);
                const col = Math.floor(Math.random() * y);
                for (let i = 0; i < snack.length; i++) {
                    const [a, b] = snack[i];
                    if (row != a && col != b) {
                        this.food = [row, col];
                        //2.0 修改食物坐标样式
                        const food = this.$refs[`li_${row}`][col];
                        food.className = "food";
                        return;
                    }
                }
            }
        },

        /**
         * 判断蛇头是否在自己身上
         * @param {null}
         * @return {void}
         */
        judgeHeadInSelfBody() {
            //拷贝数组
            const body = JSON.parse(JSON.stringify(this.snack));
            //删除数组第一项并返回蛇头坐标
            const [x, y] = body.shift(1);
            for (let i = 0; i < body.length; i++) {
                const [a, b] = body[i];
                if (a == x && b == y) {
                    return true;
                }
            }
        },

        /**
         * 初始化棋盘样式
         * @param {null}
         * @return {void}
         */
        initStyle() {
            const { layout } = this.$refs,
                { offsetWidth, offsetHeight } = layout,
                [a, b] = this.checkerArea,
                w = parseInt(offsetWidth / b) + "px",
                h = parseInt(offsetHeight / a) + "px";
            this.liStyle = { width: w, height: h };
        }
    }
};
</script>

<style scoped>
@import url("../../assets/css/snack");
</style>