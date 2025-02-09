window.addEventListener("DOMContentLoaded", function () {
    let spider = document.getElementById("spider");
    let web = document.getElementById("spider-web");

    // Animate spider and web on load
    setTimeout(() => {
        spider.style.opacity = "1";
        spider.style.transform = "translateY(0)";
        web.style.height = "100px"; // Adjust as needed
    }, 500); // Delay to ensure smooth appearance
});

window.addEventListener("scroll", function () {
    let spider = document.getElementById("spider");
    let web = document.getElementById("spider-web");
    let scrollY = window.scrollY;
    let maxMove = Math.min(scrollY * 0.5, window.innerHeight - 120); // Prevent out-of-bounds

    // Adjust movement while keeping within page bounds
    spider.style.transform = `translateY(${maxMove}px)`;
    web.style.height = `${maxMove + 50}px`; // Keep web length correct
});
