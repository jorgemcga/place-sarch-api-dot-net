var ajaxService = function () {

    let _config = '';
    let _controller = '';
    let _action = '';
    let _debug = false;
    let _waitElem;

    let _setDebugOn = function () {
        _debug = true;
        return this;
    };

    let _setConfig = function (config) {
        _config = config;
    };

    let _getWerbServiceUrl = function () {
        return config.webServiceUrl + _controller + "/" + _action;
    };

    let _getHeaders = function () {
        return {'Access-Control-Allow-Origin': config.webServiceDomain};
    };

    let _setController = function (controller) {
        _controller = controller;
    };

    let _setRoute = function (controller, action) {
        _setController(controller);
        _setAction(action);
        return this;
    };

    let _setAction = function (action) {
        _action = action;
    };

    let _send = function (data = {}, method = 'POST', dataType = 'JSON', callback = '') {

        _showWait();

        jQuery.ajax({
            headers: _getHeaders(),
            url: _getWerbServiceUrl(),
            type: method,
            dataType: dataType,
            data: data,
            success: function (formSubmitDataReturned) {
                _hideWait();

                if (_debug === true) {
                    console.log(formSubmitDataReturned);
                }
                if (callback !== '') {
                    callback(formSubmitDataReturned);
                }
            },
            error: function (jqXHR, textStatus, errorThrown) {
                _hideWait();
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
                console.log(data);
                console.log(_getWerbServiceUrl());
                alert("Erro: ajaxService.send, olhe o log ");
            }
        });
    };

//    let _sendFile = function (formElem, callback = '') {
//        _showWait();
//        let formData = new FormData(formElem);
//        console.log(formData);
//        jQuery.ajax({
//            url: config.webServiceUrl + "/files/write",
//            type: 'POST',
//            data: formData,
//            dataType: 'JSON',
//            success: function (data) {
//                _hideWait();
//                if (callback !== '') {
//                    callback(data);
//                }
//            },
//            error: function (jqXHR, textStatus, errorThrown) {
//                _hideWait();
//                console.log(jqXHR);
//                console.log(textStatus);
//                console.log(errorThrown);
//                alert("Erro: ajaxService._sendFile, olhe o log");
//            },
//            cache: false,
//            contentType: false,
//            processData: false,
//            xhr: function () {  // Custom XMLHttpRequest
//                var myXhr = $.ajaxSettings.xhr();
//                if (myXhr.upload) { // Avalia se tem suporte a propriedade upload
//                    myXhr.upload.addEventListener('progress', function () {
//                        /* faz alguma coisa durante o progresso do upload */
//                    }, false);
//                }
//                return myXhr;
//            }
//        });
//
//        return false;
//    };

    let _sendPostRetJson = function (data, callback = '') {
        _send(data, 'POST', 'JSON', callback);
    };

    let _sendPostRetText = function (data, callback = '') {
        _send(data, 'POST', 'TEXT', callback);
    };

    let _getWaitElem = function () {
//        if (!document.getElementById('ajax-wait')) {
//            _waitElem = document.createElement('div');
//            _waitElem.id = 'ajax-wait';
//            _waitElem.style.display = 'none';
//            document.body.appendChild(_waitElem);
//        }
//        return _waitElem;
    };

    let _showWait = function () {
//        let elem = _getWaitElem();
//        elem.innerHTML = "Aguarde...";
//        elem.style.display = 'block';
    };

    let _hideWait = function () {
//        let elem = _getWaitElem();
//        setTimeout(function(){
//            elem.style.display = 'none';
//        }, 500);
    };

    return {
        send: _send,
        setConfig: _setConfig,
        setRoute: _setRoute,
        setDebugOn: _setDebugOn,
        sendPostRetJson: _sendPostRetJson,
        sendPostRetText: _sendPostRetText
    };

}();

ajaxService.setConfig(config);