window.onscroll = () => {
    if (document.body.scrollTop > 160 || document.documentElement.scrollTop > 160) {
        $(".Custom-Nav").css("bottom", "0px");
        $(".Custom-Nav").css("opacity", "1");
    } else {
        $(".Custom-Nav").css("bottom", "-100px");
        $(".Custom-Nav").css("opacity", "0");
    }
};