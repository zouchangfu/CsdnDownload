// 监听来自content-script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    let { content, authorName, articleTitle } = request;
    const blob = new Blob([content], { type: 'text/x-markdown' })
    chrome.downloads.download({
        url: URL.createObjectURL(blob),
        filename: authorName + '/' + articleTitle + '.md',
        conflictAction: 'uniquify',
        saveAs: false
    }, data => {
        if (data) {
            console.info('data', data)
        }
    })
    sendResponse('下载成功！');
})