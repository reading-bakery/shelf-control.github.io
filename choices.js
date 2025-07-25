
    document.addEventListener("DOMContentLoaded", function () {
      const selects = document.querySelectorAll("select");
      selects.forEach(select => {
        new Choices(select, {
          searchEnabled: true,
          itemSelectText: '',
          shouldSort: false
        });
      });
    });