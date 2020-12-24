$(function() {

    // 文章列表地址后缀
    const ARTICLE_LIST_SUFFIX = '/article/list/'
    const ARTICLE_DETAILS_SUFFIX = '/article/details/'

    // 作者首页数据
    let homeNode = ''

    // 作者所有的文章Id
    let allArticleIds = []


    // 总计作者文章总数
    let articleTotal = 0;

    let author = $('#uid')
    let href = author.attr('href')
    let authorName = author.text().trim();


    $('body').prepend(`
    <div  class ='down_article'>
    <a href='#' id='down' class='down' >下载当前文章</a></br>
    <a href='#' id='downAll'  class='down'>下载当前作者所有文章</a>
    </div>
    `)




    /**
     * 发送消息到后台进行下载
     * @param {Object} singleNode 节点数据
     */
    function downloadArticle(articleTitle, contentHtml) {
        var turndownService = new TurndownService()
        var markdown = turndownService.turndown(contentHtml)
        let obj = {
            content: markdown,
            articleTitle: articleTitle,
            authorName: authorName
        }
        chrome.runtime.sendMessage(obj, function(response) {
            console.log(response);
        });
    }


    /**
     * 下载当前文章
     */
    function downloadCurrentArticle() {
        const contentHtml = $('.baidu_pl').html();
        const articleTitle = $('#articleContentId').text();
        downloadArticle(articleTitle, contentHtml)
    }


    /**
     * 下载所有的文章
     */
    function downloadAll() {
        cacheHomeNode(href);
        let singleNode = getSingleNode(href);
        getSingleArticleIds(singleNode);
        getAllPage();
        downloadAllArticle();
    }


    /**
     * 根据文章Id，下载文章
     */
    function downloadAllArticle() {
        allArticleIds.forEach(async(id, index) => {
            await sleep(20)
            let singleNode = getSingleNode(href + ARTICLE_DETAILS_SUFFIX + allArticleIds[index]);
            let contentHtml = singleNode.querySelector('.baidu_pl')
            let articleTitle = singleNode.querySelector('#articleContentId').innerText
            downloadArticle(articleTitle, contentHtml)
        })
    }



    /**
     * 缓存作者首页节点
     * @param {string} href 页面地址
     */
    function cacheHomeNode(href) {
        let htmlText = httpRequest(href);
        homeNode = document.createElement("div");　　
        homeNode.innerHTML = htmlText;　
    }


    /**
     * 获取作者单个页面节点
     * @param {string} href 页面地址
     */
    function getSingleNode(href) {
        let htmlText = httpRequest(href);
        let singleNode = document.createElement("div");　　
        singleNode.innerHTML = htmlText;　
        return singleNode;
    }


    /**
     * 获取单个页面所有的文章Id
     * @param {Object} node 页面数据
     */
    function getSingleArticleIds(node) {
        let list = node.querySelectorAll('div[data-articleid]')
        list.forEach((page, index) => {
            let articleId = page.getAttribute('data-articleid');
            allArticleIds.push(articleId)
        })
    }


    /**
     * 获取所有的文章
     */
    function getAllPage() {
        // 第一页数据已经获取过，这里从第二页开始获取数据
        let page = 2;
        recursionNode(page)
    }


    /**
     * 递归获取所有分页文章Id
     * @param {Object} page 分页
     */
    function recursionNode(page) {
        let singleNode = getSingleNode(href + ARTICLE_LIST_SUFFIX + page);
        let isFlag = checkNode(singleNode)
        if (isFlag) {
            getSingleArticleIds(singleNode);
            recursionNode(++page);
        } else {
            return;
        }
    }



    /**
     * 检查当前页面是否有文章
     * @param {Object} node 页面数据
     */
    function checkNode(node) {
        let list = node.querySelectorAll('div[data-articleid]')
        if (list != null && list.length > 0) {
            return true;
        }
        return false;
    }


    /**
     * 请求页面数据
     * @param {string} url 页面地址
     */
    function httpRequest(url) {
        let htmlText = '';
        $.ajax({
            url: url,
            type: "GET",
            async: false,
            success: function(data) {
                htmlText = data
            }
        });
        return htmlText;
    }


    function sleep(ms) {
        return new Promise((resolve) => {
            setTimeout(resolve, ms);
        });
    }


    //发通知
    function sendNotification(message) {
        chrome.runtime.sendMessage({ value: message }, function(response) {
            console.log(response);
        });
    }


    $('#down').click(() => {
        downloadCurrentArticle();
    })

    $('#downAll').click(() => {
        downloadAll()
    })

})