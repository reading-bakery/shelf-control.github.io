document.addEventListener("DOMContentLoaded", function () {
    const kochenLink = document.querySelector('.dropdown > a');
    const cookItems = document.querySelectorAll('.cook-item');
    const navbar = document.querySelector('.navbar');

    // Dropdown-Menü
    kochenLink.addEventListener('click', function (event) {
        event.preventDefault();

        let isVisible = false;

        cookItems.forEach(item => {
            if (item.style.display === "block") {
                item.style.display = "none";
            } else {
                item.style.display = "block";
                isVisible = true;
            }
        });

        if (isVisible) {
            navbar.classList.add('navbar-expanded');
        } else {
            navbar.classList.remove('navbar-expanded');
        }
    });

    // Sticky Navbar
    window.addEventListener('scroll', function () {
        if (window.scrollY > 0) {
            navbar.classList.add('navbar-fixed');
        } else {
            navbar.classList.remove('navbar-fixed');
        }
    });
});
