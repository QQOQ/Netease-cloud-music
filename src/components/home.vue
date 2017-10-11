<template>
	<div>
		<Row justify="center" type="flex" class="head">
			<Col :xs="20" :sm="18" :md="16" :lg="9">
				<h1 id="title">网易云音乐 <sub>by 萨萨</sub></h1>
			    <AutoComplete v-model="searchQuery" icon="ios-search" placeholder="输入歌名进行搜索" size="large" @on-select="selectMusic">
			        <div class="demo-auto-complete-item" v-for="item in data4">
			            <div class="demo-auto-complete-group">
			                <span>{{ item.title }}</span>
			                <a href="javascript:;" target="_blank">更多</a>
			            </div>
			            <Option v-for="option in item.children" :value="option.id" :key="option.id">
			                <span class="demo-auto-complete-title">{{ option.name }}</span>
			                <span class="demo-auto-complete-count">{{ option.artists[0].name }}</span>
			            </Option>
			        </div>
			        <a class="demo-auto-complete-more">共找到 {{ count }} 个结果</a>
			    </AutoComplete>
		    </Col>
	    </Row>
	    <Row justify="center" type="flex" class="music-main">
	    	<Col :xs="20" :sm="18" :md="16" :lg="9">
	    		<div id="my-music"></div>
	    	</Col>
	    </Row>
	    <div class="copy">自豪地采用vue + iview</div>
	</div>
</template>
<script>
    export default {
    	name: 'home',
        data () {
            return {
            	smusic: '',
            	songList: [], //歌曲列表
            	apiURL: 'http://43.248.102.117:3000', //api接口
            	count: 0, // 搜索结果数量
                searchQuery: '',
                searchQueryIsDirty: false,
    			isCalculating: false,
                data4: [
                    {
                        title: '搜索列表',
                        children: []
                    }
                ]
            }
        },
    //     computed: {
	   //  	searchIndicator: function () {
	   //    		if (this.isCalculating) {
		  //       	return '⟳ Fetching new results'
		  //     	}else if (this.searchQueryIsDirty) {
		  //       	return '... Typing'+this.searchQuery
		  //     	}else {
		  //       	return '✓ Done'
		  //     	}
	   //  	}
	  	// },
	  	watch: {
	    	searchQuery: function () {
	      		this.searchQueryIsDirty = true
	      		this.expensiveOperation()
	    	}
	  	},
        methods: {
        	// 根据关键字搜索音乐
        	searchList(str){
        		if(!str)
        			return
        		this.$http.get(this.apiURL+'/search', {params:{keywords:str}}).then(function(response){
        			// 响应成功回调
        			//console.log(response)
        			var data = response.body
        			// 查询错误
				    if(data.code != 200){
				    	this.$Message.error(response.body.msg);
				    	return
				    }
				    var result = data.result
					this.count = result.songCount
					var songList = result.songs
					this.data4[0].children = songList
					// console.log(songList)
				}, function(response){
				    // 响应错误回调
				    this.$Message.error('网络错误');
				});
        	},
        	// 根据歌单ID获取歌单信息
        	searchListById(sid){
        		this.$http.get(this.apiURL+'/playlist/detail', {params:{id:sid}}).then(function(response){
        			// 响应成功回调
        			// console.log(response)
        			var data = response.body
        			// 查询错误
				    if(data.code != 200){
				    	this.$Message.error(response.body.msg);
				    	return
				    }
				    var musicList = data.playlist.tracks
				    var newMusicList = [];
				    if(musicList.length > 0){
				    	for (var x in musicList){
				    		newMusicList[x] = {
				    			title: musicList[x].name,
				    			singer: musicList[x].ar[0].name,
				    			audio: this.apiURL+'/music/url?id='+musicList[x].id,
				    			thumbnail: musicList[x].al.picUrl,
				    			lyric: this.apiURL+'/lyric?id='+musicList[x].id
				    		}
				    	}
				    }
				    this.songList = newMusicList
				    // 初始化播放器
				    this.smusic = SMusic(this.songList, {
				    	volume: .8,
				    	playMode: 1,
				    	autoPlay: 1,
						container : document.getElementById('my-music')
					});
					this.smusic.init()
				    // console.log(newMusicList);
				}, function(response){
				    // 响应错误回调
				    this.$Message.error('网络错误');
				});
        	},
        	// 根据歌曲ID获取歌曲详情
        	getMusicById(mid,funCallback){
        		this.$http.get(this.apiURL+'/song/detail', {params:{ids:mid}}).then(function(response){
        			// 响应成功回调
        			// console.log(response)
        			var data = response.body
        			// 查询错误
				    if(data.code != 200){
				    	this.$Message.error(response.body.msg);
				    	return
				    }
				 	var result = data.songs[0]
					funCallback(result)
				}, function(response){
				    // 响应错误回调
				    this.$Message.error('网络错误');
				});
        	},
        	// 搜索列表选中歌曲
        	selectMusic(val){
        		var t = this;
        		this.getMusicById(val,function(data) {
        			// console.log(data)
        			// 将选中歌曲追加到列表
        			var newMusic = [];
        			newMusic = {
		    			title: data.name,
		    			singer: data.ar[0].name,
		    			audio: t.apiURL+'/music/url?id='+data.id,
		    			thumbnail: data.al.picUrl,
		    			lyric: t.apiURL+'/lyric?id='+data.id
		    		}
		    		// console.log(newMusic)
		    		t.smusic.addSong(newMusic, function () {
		                // newMusic = null; //防止重复追加
		            });
        		})
        	},
        	expensiveOperation: _.debounce(function () {
		      	this.isCalculating = true
		      	setTimeout(function () {
		        	this.isCalculating = false
		        	this.searchQueryIsDirty = false
		      	}.bind(this), 1000)
		      	this.searchList(this.searchQuery)
		    }, 500)
        },
        mounted:function(){
	        this.searchListById(543286550);
	        //console.log(this.songList)
	    }
    }
</script>
<style>
	.smusic-container .smusic-list--wrap>.smusic-list--scroll, .smusic-container .smusic-lyric--wrap>.smusic-lyric--scroll{
		padding-right: 10px;
	}
	.smusic-container a{
		color: #333;
	}
	.copy{
		color: #9ea7b4;
		font-size: 13px;
		text-align: center;
		margin-top: 30px;
	}
	.smusic-container{
		width: 100%;
		padding: 20px 0;
	}
	.music-main{
		padding-top: 30px;
	}
	.head{
		background: #2d8cf0;
		padding-bottom: 50px;
	}
	#title{
		text-align: center;
		margin-bottom: 40px;
		width: 100%;
		margin-top: 50px;
		color: #f8f8f9;
	}
	#title sub{
		font-size: 12px;
		color: #5cadff;
	}
    .demo-auto-complete-item{
        padding: 4px 0;
        border-bottom: 1px solid #F6F6F6;
    }
    .demo-auto-complete-group{
        font-size: 12px;
        padding: 4px 6px;
    }
    .demo-auto-complete-group span{
        color: #666;
        font-weight: bold;
    }
    .demo-auto-complete-group a{
        float: right;
    }
    .demo-auto-complete-count{
        float: right;
        color: #999;
    }
    .demo-auto-complete-more{
        display: block;
        margin: 0 auto;
        padding: 4px;
        text-align: center;
        font-size: 12px;
    }
    .smusic-music-thumbnail{
    	position: relative;
    }
    .smusic-music-thumbnail:before{
    	position: absolute;
    	content: '';
    	width: 40px;
    	height: 40px;
    	border-radius: 50%;
    	background-color: #fff;
    	left: 50%;
    	top: 50%;
    	margin-top: -20px;
    	margin-left: -20px;
    	box-shadow: 0px 3px 3px #c8c8c8 inset;
    	z-index: 1;
    }
    .js-smusic-song--thumbnail{
    	box-shadow: 0px 0px 3px 3px #bbb;
    }
    .js-smusic-song--thumbnail.on{
    	-webkit-animation: rotating 5s linear infinite;
    	animation: rotating 5s linear infinite;
    }
    @-webkit-keyframes rotating {
		from{
			-webkit-transform: rotate(0deg);
			-moz-transform: rotate(0deg);
			-ms-transform: rotate(0deg);
			-o-transform: rotate(0deg);
	    	transform: rotate(0deg);
		}
		to{
			-webkit-transform: rotate(360deg);
			-moz-transform: rotate(360deg);
			-ms-transform: rotate(360deg);
			-o-transform: rotate(360deg);
			transform: rotate(360deg);
		}
	}
	@keyframes rotating {
	    from{
	        -webkit-transform: rotate(0deg);
			-moz-transform: rotate(0deg);
			-ms-transform: rotate(0deg);
			-o-transform: rotate(0deg);
	        transform: rotate(0deg);
	    }
	    to{
	        -webkit-transform: rotate(360deg);
			-moz-transform: rotate(360deg);
			-ms-transform: rotate(360deg);
			-o-transform: rotate(360deg);
	        transform: rotate(360deg);
	    }
	}
</style>