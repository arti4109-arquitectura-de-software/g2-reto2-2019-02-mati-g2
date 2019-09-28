(function () {
    var db, input, ul;

    databaseOpen(function () {
        ul = document.querySelector('ul');
        input = document.querySelector('input');
        document.body.addEventListener('click', onClick);
        document.body.addEventListener('submit', onSubmit);
        databaseGet(renderAll);
    });
    
    function databaseOpen(callback) {
        var version = 1;
        var request = indexedDB.open('cajas', version);
        request.onupgradeneeded = function (e) {
            db = e.target.result;
            e.target.transaction.onerror = databaseError;
            db.createObjectStore('caja', { keyPath: 'timeStamp' });
        };
        request.onsuccess = function (e) {
            db = e.target.result;
            callback();
        };
        request.onerror = databaseError;
    }

    function databaseAdd(text, callback) {
        var transaction = db.transaction(['caja'], 'readwrite');
        var store = transaction.objectStore('caja');
        var request = store.put({text: text,timeStamp: Date.now()});
        transaction.oncomplete = function (e) { callback(); };
        request.onerror = databaseError;
    }

    function databaseGet(callback) {
        var transaction = db.transaction(['caja'], 'readonly');
        var store = transaction.objectStore('caja');
        var keyRange = IDBKeyRange.lowerBound(0);
        var cursorRequest = store.openCursor(keyRange);
        var data = [];
        cursorRequest.onsuccess = function (e) 
        {
            var result = e.target.result;
            if (result) 
            {
                data.push(result.value);
                result.continue();
            } else
                callback(data);
        };
    }

    function databaseDelete(id, callback) {
        var transaction = db.transaction(['caja'], 'readwrite');
        var store = transaction.objectStore('caja');
        var request = store.delete(id);
        transaction.oncomplete = function (e) { callback(); };
        request.onerror = databaseError;
    }

    function databaseError(e) {
        console.error('IndexedDB Error', e);
    }

    function onSubmit(e) {
        e.preventDefault();
        databaseAdd(input.value, function () {
            databaseGet(renderAll);
            input.value = '';
        });
    }

    function renderAll(items) {
        var html = '';
        items.forEach(function (item) { html += itemToHtml(item); });
        ul.innerHTML = html;
    }

    function itemToHtml(item) {
        return '<li id="' + item.timeStamp + '">' + item.text + '</li>';
    }

    function onClick(e) {
        if (e.target.hasAttribute('id')) {
            databaseDelete(parseInt(e.target.getAttribute('id'), 10), function () {
                databaseGet(renderAll);
            });
        }
    }
}());

var connected = true;

function postToServer(item) {
    $.ajax({
        type: "POST",
        url: "https://localhost:44313/api/Values",
        data: item.id,
        success: function (data) {
            connected = true;
            console.log("Valid Requests");
            item.click();
        },
        error: function (error) {
            connected = false;
            console.log("Error Requests");
        },
        complete: function () {
            setOnlineStatus();
        },
        dataType: "json"
    });
}

setInterval(sendInvoices, 10000);

function sendInvoices() {
    if (navigator.onLine) {
        var invoices = $(".invoices li");
        invoices.each(function () {
            setTimeout(postToServer(this), 2000);
        });
    } else {
        connected = false;
        setOnlineStatus();
    }
}

function setOnlineStatus() {
    $("#LineStatus").text(connected == true ? "Online" : "Offline");
}