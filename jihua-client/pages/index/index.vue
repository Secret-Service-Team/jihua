<template>	
		<view class="total" :style="{height:total_height}">
			<view class="time-top">
				<!--头部分 -->
				<view class="liebiao">
					<!--左上角的那个图标-->
					<img src="~@/static/icon/lie.png" alt="" @click="change_to_history">
				</view>

				<view class="method-of-timer" v-show="show_or_not_show">
					<!--正计时/倒计时-->
					<view class="zheng" @click="setting_zheng_time">
						正计时
					</view>
					<view class="dao" @click="setting_dao_time">
						倒计时
					</view>
				</view>
				<view style="width: 300rpx;hight: 55rpx;" v-show="!show_or_not_show"></view>
			</view>
			<!--======================================================= -->
			<view class="time-middle">
				<!--中间部分 -->
				<view class="jitang">这里是没有毒的鸡汤</view>
				<view class="total-time" v-show="show_or_not_show">今日已专注时长:{{total_time>=3600?
				' '+(Math.floor(total_time/3600)+' h '+(Math.floor(total_time/60-Math.floor(total_time/3600)*60))+' min')
				:
				('  '+Math.floor(total_time/60)+' min')}}
				</view>
				<view style="height: 60rpx;" v-show="!show_or_not_show">
				</view>
			</view>

			<!--======================================================= -->
			<view class="time-bottom">
				<!--尾部分 -->
				<view style="position: relative;"><canvas id="myCanvas" canvas-id="myCanvas"></canvas></view>
				<view class="min-second" v-show="show_timer">
					<!--MIN和SEC-->
					<view class="min">MIN</view>
					<view class="second">SEC</view>
				</view>

				<view class="dao_timer" v-show="!show_timer">
					<!--倒计时的界面，一开始的时候默认为正计时界面，该界面隐藏-->
					<view v-for="(item,i) in setting_time" :key="i" class="dao_timer_father">
						<view class="dao_timer_son">
							<view>{{min>=10?min:'0'+min}}&nbsp;&nbsp;MIN</view>
							<view>{{item>=10?item:'0'+item}}&nbsp;&nbsp;SEC</view>
						</view>
					</view>
				</view>

				<view class="timer" v-show="show_timer" @click="change_time_in_dao">{{min>=10?min:'0'+min}}:{{sec>=10?sec:'0'+sec}}</view>
				<!--时钟界面，用于正/倒计时 -->

				<view class="botton-begin-timer" v-show="timer_flag"><img @click="begin_of_timer" src="~@/static/icon/begin.png"></view>
				<!--开启按钮-->

				<view class="box-of-stop" v-show="!timer_flag">
					<!--暂停和关闭按钮 -->
					<view> <img src="~@/static/icon/stop.png" @click="stop_timer"></view>
					<view><img src="~@/static/icon/juxing.png" @click="end_timer"></view>
				</view>

			</view>

			<view class="set-goal" v-show="show_of_setting_things">
				<view class="grey" @click="close_things"></view>
				<view class="content">
					<view class="henggan"></view>
					<view class="title">请输入你的专注目标</view>
					<view class="things">
						<view class="write-things">
							<input type="text" id="writeThing" v-model="target" :class="style" @focus="input_in" @blur="input_out" ref="input_in">
						</view>
						<view class="choice-things">
							<view v-for="(item,index) in need_to_do_list" :key="index">
								{{item}}
							</view>
						</view>
					</view>
					<view class="begin-to-time" @click="gogogo">开始计时</view>
				</view>
			</view>
		</view>
</template>

<script>
	
	export default {
		onReady: function(e) {
			var context = uni.createCanvasContext('myCanvas')
			context.setStrokeStyle("rgb(170,169,167)")
			context.setLineWidth(3 * this.a)
			context.moveTo(190 * this.a, 0)
			context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
			context.stroke()
			context.draw()
		},
		
		data() {
			return {
				a: 0, //比例因子
				total_time: 0,
				total_height: 0,
				min: 0,
				sec: 0,
				timer_flag: true,
				_timer: null,
				zheng_or_dao_flag: true, //判断是正计时还是倒计时，true正，false倒
				setting_time: [40, 41, 42, 43, 44],
				show_timer: true, //是否显示时钟，true为显示
				show_or_not_show: true, //是否显示 正计时/倒计时 和 今日已专注时长  这两个标签， true为显示
				time_of_index: 0,
				need_to_do_list: [],
				show_of_setting_things: false, //是否显示选择待办事项界面，true进入
				target: "请输入专注目标",
				style: ["write", "white"],
				dao_total_time: 0, //倒计时总时间
				i: 1, //记次数用的
				context: uni.createCanvasContext('myCanvas'), //画布名字
				begin_min: 0, //开始时候的min
				begin_sec: 0, //开始时候的sec
			}
		},
		onLoad() {
			this.total_height = this.getData() + 'rpx'
			this.a = this.get_a() / 750
		},
		methods: {


			getData() {
				var result = 0
				uni.getSystemInfo({
					success: function(res) {
						result = res.screenHeight * 2 - res.statusBarHeight * 2
						console.log(result)
					}
				})
				return result
			},
			get_a() {
				var result = 0
				uni.getSystemInfo({
					success: function(res) {
						result = res.windowWidth * 2
					}
				})
				return result
			},
			begin_of_timer() { //开始计时
				clearInterval(this._timer)
				this.show_timer = true
				this.show_or_not_show = false
				if (!this.time_of_index) {
					if (!this.zheng_or_dao_flag) {
						this.begin_sec = this.sec = 41
						this.begin_min = this.min = 24
						this.dao_total_time = this.min * 60 + this.sec
					}
					this.show_of_setting_things = true
					this.time_of_index++
				} else if (this.time_of_index == 1) {
					this.timer_flag = !this.timer_flag
					if (!this.zheng_or_dao_flag) { //倒计时

						this._timer = setInterval(() => {
							if (this.min || this.sec) { //正常计时
								if (!this.sec && this.min) {
									this.min--
									this.sec = 60
								}
								this.sec--
								this.context.setStrokeStyle("rgb(170,169,167)")
								this.context.setLineWidth(3 * this.a)
								this.context.moveTo(190 * this.a, 0)
								this.context.arc(100 * this.a, 0, 90 * this.a, 0, (1.0 / this.dao_total_time) * this.i * Math.PI, false) //正计时一小时的时候，弧将充满
								this.context.stroke()
								this.context.draw(true)
								this.i++
							} else { //计时结束
								console.log("计时结束")
								clearInterval(this._timer)
							}
						}, 1000)
					} else { //正计时
						this._timer = setInterval(() => {
							this.sec++
							if (this.sec == 60) {
								this.sec = 0
								this.min++
							}
							this.context.setStrokeStyle("white")
							this.context.setLineWidth(3 * this.a)
							this.context.moveTo(190 * this.a, 0)
							this.context.arc(100 * this.a, 0, 90 * this.a, 0, (1.0 / 3600) * this.i * Math.PI, false)
							this.context.stroke()
							this.context.draw(true)
							this.i++
							if (this.i == 3601) {
								console.log("您已经学习了一个小时了")
								this.context.setStrokeStyle("rgb(170,169,167)")
								this.context.setLineWidth(3 * this.a)
								this.context.moveTo(190 * this.a, 0)
								this.context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
								this.context.stroke()
								this.context.draw()
								this.i = 1
							}
						}, 1000)
					}
				}

			},
			stop_timer() { //停止计时
				this.timer_flag = !this.timer_flag
				clearInterval(this._timer)
			},
			end_timer() {
				this.timer_flag = !this.timer_flag
				this.show_or_not_show = true
				clearInterval(this._timer)
				this.time_of_index = 0
				if (this.zheng_or_dao_flag)
					this.total_time += this.min * 60 + this.sec
				else
					this.total_time += this.begin_min * 60 + this.begin_sec - this.min * 60 - this.sec
			},
			setting_zheng_time() {

				this.time_of_index = 0
				this.show_timer = true
				this.zheng_or_dao_flag = true
				this.sec = 0
				this.min = 0
				this.context.setStrokeStyle("rgb(170,169,167)")
				this.context.setLineWidth(3 * this.a)
				this.context.moveTo(190 * this.a, 0)
				this.context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
				this.context.stroke()
				this.context.draw()
				clearInterval(this._timer)

			},
			setting_dao_time() {
				this.time_of_index = 0
				clearInterval(this._timer)
				this.show_timer = false
				this.zheng_or_dao_flag = false
				this.timer_flag = true
				this.min = 24
				this.sec = 41
				this.context.setStrokeStyle("white")
				this.context.setLineWidth(3 * this.a)
				this.context.moveTo(190 * this.a, 0)
				this.context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
				this.context.stroke()
				this.context.draw()
			},
			close_things() {
				this.show_of_setting_things = false
				this.time_of_index = 0
				this.show_or_not_show = true
			},
			change_time_in_dao() {
				if (!this.zheng_or_dao_flag && !this.time_of_index) {
					this.show_timer = false

				}
			},
			gogogo() {
				if (this.target != "" && this.target != "请输入专注目标")
					this.need_to_do_list.unshift(this.target)
				if (this.target == "请输入专注目标" && this.need_to_do_list.length == 0) {
					this.style.pop()
					this.style.push("red")
				} else {
					this.target = "请输入专注目标"
					this.show_of_setting_things = false
					this.timer_flag = !this.timer_flag
					clearInterval(this._timer)
					if (!this.zheng_or_dao_flag) { //倒计时
						this.i = 1
						this._timer = setInterval(() => {
							if (this.min || this.sec) { //正常计时
								if (!this.sec && this.min) {
									this.min--
									this.sec = 60
								}
								this.sec--
								this.context.setStrokeStyle("rgb(170,169,167)")
								this.context.setLineWidth(3 * this.a)
								this.context.moveTo(190 * this.a, 0)
								this.context.arc(100 * this.a, 0, 90 * this.a, 0, (1.0 / this.dao_total_time) * this.i * Math.PI, false) //正计时一小时的时候，弧将充满
								this.context.stroke()
								this.context.draw(true)
								this.i++
							} else { //计时结束
								console.log("计时结束")
								clearInterval(this._timer)
							}
						}, 1000)
					} else {
						this.i = 1
						this.sec = 0
						this.min = 0
						this.context.setStrokeStyle("rgb(170,169,167)")
						this.context.setLineWidth(3 * this.a)
						this.context.moveTo(190 * this.a, 0)
						this.context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
						this.context.stroke()
						this.context.draw()
						this._timer = setInterval(() => {
							this.sec++
							if (this.sec == 60) {
								this.sec = 0
								this.min++
							}
							this.context.setStrokeStyle("white")
							this.context.setLineWidth(3 * this.a)
							this.context.moveTo(190 * this.a, 0)
							this.context.arc(100 * this.a, 0, 90 * this.a, 0, (1.0 / 3600) * this.i * Math.PI, false) //正计时一小时的时候，弧将充满
							this.context.stroke()
							this.context.draw(true)
							this.i++
							if (this.i == 3601) {
								console.log("您已经学习了一个小时了")
								this.context.setStrokeStyle("rgb(170,169,167)")
								this.context.setLineWidth(3 * this.a)
								this.context.moveTo(190 * this.a, 0)
								this.context.arc(100 * this.a, 0, 90 * this.a, 0, Math.PI, false)
								this.context.stroke()
								this.context.draw()
								this.i = 1
							}
						}, 1000)
					}
				}
			},
			input_in() {
				if (this.target == "请输入专注目标")
					this.target = ""
				this.style.pop()
			},
			input_out() {
				if (this.target == "")
					this.target = "请输入专注目标"
				this.style.push("white")
			},
			change_to_history(){
				uni.navigateTo({
					url:"../history/history"
				})
			}
		}
	}
</script>

<style>
	#myCanvas {
		position: absolute;
		top: 100rpx;
		left: 23%;
		height: 220rpx;
		width: 500rpx;
		pointer-events: none;
	}
	.right {
		width: 55rpx;
		height: 55rpx;
	}

	.total {
		color: white;
		padding-top: 30rpx;
		background: url(~@/static/BGT/BGT.jpg) no-repeat;
		background-size: 100% 100%;
		background-position: 0 0;
	}

	.time-top {
		display: flex;
		justify-content: space-around;
		margin-bottom: 30rpx;
		margin-top: 30rpx;
	}

	.liebiao {
		width: 300rpx;
		height: 55rpx;
	}

	.liebiao img {
		margin-left: 8rpx;
		width: 55rpx;
		height: 55rpx;
		margin-right: 20rpx;
	}

	.method-of-timer {
		display: flex;
		justify-content: space-between;
		width: 300rpx;
		height: 55rpx;
	}

	.method-of-timer view {
		width: 150rpx;
		height: 55rpx;
		line-height: 55rpx;
		text-align: center;
	}

	.zheng {
		border: 1rpx solid white;
		border-top-left-radius: 22.5rpx;
		border-bottom-left-radius: 22.5rpx;
	}

	.dao {
		border: 1rpx solid white;
		border-top-right-radius: 22.5rpx;
		border-bottom-right-radius: 22.5rpx;
		color: rgb(98, 39, 37);

	}

	.jitang {
		margin: 0 auto;
		text-align: center;
		width: 600rpx;
		height: 55rpx;
		line-height: 55rpx;
		font-weight: bold;
		color: white;
		font-size: 55rpx;
		margin-bottom: 40rpx;
	}

	.total-time {
		margin: 0 auto;
		text-align: center;
		width: 520rpx;
		border: 1rpx solid #FFFFFF;
		height: 55rpx;
		line-height: 55rpx;
		border-radius: 22.5rpx;

	}

	.time-bottom {
		height: 720rpx;
		margin-top: 60rpx;
	}

	.min-second {
		display: flex;
		justify-content: space-around;
		width: 100%;
	}

	.dao_timer {
		margin-bottom: 200rpx;
	}

	.dao_timer_father {
		width: 42%;
		margin: 0rpx auto;
		/*border: 1px solid #000000;*/
		z-index: 1;
		position: relative;
	}

	.dao_timer_son {
		display: flex;
		justify-content: space-around;

	}

	.dao_timer_father:nth-child(3) {
		border-top: 1px solid white;
		border-bottom: 1px solid white;
	}

	.min {
		width: 300rpx;
		text-align: right;
		font-size: 30rpx;
	}

	.second {
		width: 300rpx;
		font-size: 30rpx;
	}

	.timer {
		width: 50%;
		margin: 0rpx auto 250rpx auto;
		z-index: 1;
		text-align: center;
		font-size: 120rpx;
		/*border: 1px solid #000000;*/
		position: relative;
	}

	.time-bottom img {
		width: 100rpx;
		height: 100rpx;
	}

	.botton-begin-timer {
		text-align: center;
	}

	.box-of-stop {
		display: flex;
		justify-content: space-around;
	}

	.set-goal {
		bottom: 0;
		position: fixed;
	}

	.content {
		position: fixed;
		bottom: 0rpx;
		background-color: white;
		width: 100%;
		color: #000000;
		border-top-right-radius: 70rpx;
		border-top-left-radius: 70rpx;
		text-align: center;
		z-index: 8;
	}

	.henggan {
		background-color: rgb(221, 221, 221);
		height: 6rpx;
		width: 60rpx;
		margin: 30rpx auto;
	}

	.grey {
		width: 100%;
		height: 100%;
		z-index: 2;
		position: fixed;
		top: 0;
		left: 0;
		background-color: rgba(159, 159, 159, 0.1);
	}

	.title {
		font-weight: bold;
		margin-bottom: 40rpx;
	}

	.things {
		display: flex;
		justify-content: space-around;
	}

	.write {
		background-color: rgb(240, 240, 240);
		height: 100rpx;
		line-height: 100rpx;
		border-radius: 22.5rpx;
		font-size: 20rpx;
		width: 350rpx;

	}

	.white {
		color: rgb(193, 191, 191);
	}

	.red {
		color: red;
	}

	.choice-things {
		margin-right: 100rpx;
	}

	.begin-to-time {
		height: 55rpx;
		line-height: 55rpx;
		border-radius: 22.5rpx;
		background-color: #000000;
		color: white;
		width: 60%;
		margin: 20rpx auto;
	}
</style>
