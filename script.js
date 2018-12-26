function getURLParameter(name) {
    return decodeURIComponent((new RegExp("[?|&]" + name + "=" + "([^&;]+?)(&|#|;|$)").exec(location.search) || [null, ""])[1].replace(/\+/g, "%20")) || null;
}

function edit() {
    window.location.href = "index.html?page=" + encodeURIComponent(getURLParameter("page")) + "&edit=true"
}

function cancel() {
    window.location.href = "index.html?page=" + encodeURIComponent(getURLParameter("page"))
}

function save() {
    if ($(".savePass").val() != "" && getURLParameter("page") != null && getURLParameter("page").replace(/[.$\[\]#/]/g, "") != "") {
        $(".message").text("Saving...");
        $(".savePass").css("background-color", "#7e7e7e");

        try {
            firebase.database().ref("pages/" + getURLParameter("page").replace(/[.$\[\]#/]/g, "")).set({
                content: $(".content").html().replace(/<div>/g, "").replace(/<\/div>/g, "<br>").replace(/<br>/g, "\n").replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                password: sha256.create().update($(".savePass").val()).hex()
            }).then(function() {
                cancel();
            });

            setTimeout(function() {
                $(".message").text("Couldn't save. Incorrect password?");
                $(".savePass").css("background-color", "#af0101");
                $(".savePass").val("");
            }, 5000);
        } catch (e) {
            $(".message").text("Couldn't save due to unspecified error.");
            $(".savePass").css("background-color", "#af0101");
            $(".savePass").val("");
        }
    } else {
        if (getURLParameter("page") == null || getURLParameter("page").replace(/[.$\[\]#/]/g, "") == "") {
            $(".message").text("Invalid URL.");
            $(".savePass").css("background-color", "#af0101");
        } else {
            $(".message").text("Password must not be blank.");
            $(".savePass").css("background-color", "#af0101");
        }
    }
}

$(function() {
    if (getURLParameter("page") == null) {
        window.location.href = "index.html?page=home";
    }

    firebase.database().ref("pages/" + getURLParameter("page").replace(/[.$\[\]#/]/g, "")).once("value", function(snapshot) {
        $(".content").html(snapshot.val().content.replace(/<div>/g, "").replace(/<\/div>/g, "<br>").replace(/<br>/g, "\n").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    });

    if (getURLParameter("edit") == "true") {
        $(".content").attr("contenteditable", "true");
        $(".view").hide();
    } else {
        $(".edit").hide();
    }
});