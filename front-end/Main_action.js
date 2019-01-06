function Download(){
	var auth = new URLSearchParams();         
    var params = new URLSearchParams();
    var formData = new FormData();
    params.append("user", "abc");
    params.append("func", "download");
    params.append("path", "/abc/")
    params.append("filename", "a.py")
    formData.append("auth", auth);
    formData.append("params", params);
    $.ajax({
        url: "/cgi-bin/serve.py", 
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
            alert(response)
        },
        error: function (xhr) {
            alert(xhr.status + " " + xhr.statusText + "\n"
                + xhr.responseText);
        }
    });
}

// 上传文件，还有不少需要完善
function upload(File, Proc){
	var file = File[0].files[0];
    var size = file.size;
    var chuck = 1000000;
    var num = Math.ceil(size / chuck);

    var md5list = new Array(num);
    var ajaxlist = new Array(num);

    var proc = 0;
    Proc[0].innerHTML = "process: " + proc.toFixed(0) + "%";

    for (var i = 0; i < num; i++) {
        var beg = i * chuck;
        var end = beg + chuck;
        if (end > size)
            end = size
        var slice = file.slice(beg, end);

        var formData = new FormData();
        var auth = new URLSearchParams();
        auth.append("user", "root");
        var params = new URLSearchParams();
        params.append("func", "save_file");
        params.append("no", i);
        formData.append("auth", auth);
        formData.append("params", params);
        formData.append("file", slice);

        ajaxlist[i] = $.ajax({
            url: "/cgi-bin/serve.py",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                var json = JSON.parse(response)
                md5list[json.no] = json.md5;
                proc += 100 / num;
                $("#proc")[0].innerHTML = "process: " + proc.toFixed(0) + "%";
                // alert(response);
            }
            // error handler
        });
    }

    $.when.apply(null, ajaxlist).done(function () {
        var md5data = md5list.join('","');
        md5data = "[\"" + md5data + "\"]";

        var formData = new FormData();
        var auth = new URLSearchParams();
        auth.append("user", "root");
        var params = new URLSearchParams();
        params.append("func", "commit");
        params.append("filename", file.name);
        params.append("path", "/abc"); // TODO: now fixed in code
        params.append("size", size);
        params.append("md5", md5data);
        formData.append("auth", auth);
        formData.append("params", params);
        $.ajax({
            url: "/cgi-bin/serve.py",
            type: "POST",
            data: formData,
            processData: false,
            contentType: false,
            success: function (response) {
                alert(response);
            },
            error: function (xhr) {
                alert(xhr.status + " " + xhr.statusText + "\n"
                    + xhr.responseText);
            }
        });
    });
}