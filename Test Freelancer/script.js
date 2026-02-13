$(document).ready(function () {
   $('li').each(function () {
      if ($(this).find('.submenu').length > 0) {
         $(this).addClass('mega-menu');
      } else {
         $(this).addClass('single-menu');
      }
   });

$('.increment').click(function(e) {
    e.preventDefault();
    // Find the input with class 'counter' in the same form as the clicked button
    let $counter = $(this).closest('form').find('.counter');
    let value = parseInt($counter.val()) || 0;
    $counter.val(value + 1);
});


   $('.menu-links > a').on('click', function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $parent = $(this).parent('.menu-links');

      $('.menu-links').not($parent).removeClass('is-active');
      $('.submenu').not($(this).siblings('.submenu')).removeClass('menu-open');

      $parent.toggleClass('is-active');

      $(this).siblings('.submenu').toggleClass('menu-open');

      $('.menu-overlay').toggleClass(
         'active',
         $('.submenu.menu-open').length > 0
      );
   });

   $('.submenu, .menu-links').on('click', function (e) {
      e.stopPropagation();
   });


   $(document).on('click', function () {
      closeMenu();
   });

   $('.menu-overlay').on('click', function () {
      closeMenu();
   });

   function closeMenu() {
      $('.menu-links').removeClass('is-active');
      $('.submenu').removeClass('menu-open');
      $('.menu-overlay').removeClass('active');
   }

   const $target = $('#menu');

   if ($target.length) {
      const observer = new MutationObserver(function () {
         const isOpen = $('#menu li.menu-links.mega-menu.is-active').length > 0;
         $('.inner-header').toggleClass('menu-active', isOpen);
      });

      observer.observe($target[0], { // MutationObserver needs the raw DOM element
         attributes: true,
         subtree: true,
         attributeFilter: ['class']
      });
   }


   // tab

   $('.tab-btn').click(function () {
      const tabId = $(this).data('tab');

      $('.tab-btn').removeClass('active');
      $(this).addClass('active');

      $('.tab-pane').removeClass('active');
      $('#' + tabId).addClass('active');
   });


 $('#menu-toggle').on('click', function () {
      $('body').toggleClass('nav-open');
   });

      $('.dropdown').each(function () {
      var $dropdown = $(this);
      var isSingle = $dropdown.data('single') === true;
      var $selectBox = $dropdown.find('.select-box');
      var $optionsContainer = $dropdown.find('.options-container');
      var $searchInput = $dropdown.find('.search-input');
      var $noResult = $dropdown.find('.no-result');
      var $hoveredOption = null;
      var selected = isSingle ? null : []; // single: one value, multi: array

      function updateSelected() {
         var $container = $dropdown.find('.selected-items');
         $container.empty();
         if (isSingle) {
            if (!selected) {
               $container.text($dropdown.hasClass('single-select-dropdown') ? ' ' : 'Select subcategories');
            } else {
               var text = $optionsContainer.find('.option[data-value="' + selected + '"]').text();
               var $tag = $('<div class="tag">' + text + '<span class="remove">x</span></div>');
               $tag.find('.remove').click(function (e) {
                  e.stopPropagation();
                  selected = null;
                  updateSelected();
               });
               $container.append($tag);
            }
         } else {
            if (!selected.length) {
               $container.text(' ');
            } else {
               $.each(selected, function (i, val) {
                  var text = $optionsContainer.find('.option[data-value="' + val + '"]').text();
                  var $tag = $('<div class="tag">' + text + '<span class="remove">x</span></div>');
                  $tag.find('.remove').click(function (e) {
                     e.stopPropagation();
                     selected = selected.filter(function (item) {
                        return item !== val;
                     });
                     updateSelected();
                  });
                  $container.append($tag);
               });
            }
         }
      }

      $selectBox.click(function (e) {
         e.stopPropagation();
         $optionsContainer.toggle();
         $searchInput.val('').trigger('input');
         $searchInput.focus();
      });

      // Corrected click handlers
      if (isSingle) {
         // Single-select: only direct options
         $optionsContainer.on('click', '.option', function (e) {
            e.stopPropagation();
            selected = $(this).data('value');
            updateSelected();
            $optionsContainer.hide();
         });
      } else {
         // Multi-select: only sub-options inside categories
         $optionsContainer.on('click', '.sub-options .option', function (e) {
            e.stopPropagation();
            var value = $(this).data('value');

            // Prevent double selection
            if ($.inArray(value, selected) === -1) {
               selected.push(value);
               updateSelected();

               // **Close dropdown after selecting**
               $optionsContainer.hide();
            }
         });
      }

      // Search (starts with)
      $searchInput.on('input', function () {
         var query = $(this).val().toLowerCase();
         var foundAny = false;
         $hoveredOption = null;

         if (isSingle) {
            $optionsContainer.find('.option').each(function () {
               var text = $(this).text().toLowerCase();
               if (text.startsWith(query)) {
                  $(this).show();
                  foundAny = true;
               } else {
                  $(this).hide();
               }
               $(this).removeClass('hovered');
            });
         } else {
            $optionsContainer.find('.category').each(function () {
               var foundInCategory = false;
               $(this).find('.sub-options .option').each(function () {
                  var text = $(this).text().toLowerCase();
                  if (text.startsWith(query)) {
                     $(this).show();
                     foundInCategory = true;
                  } else {
                     $(this).hide();
                  }
                  $(this).removeClass('hovered');
               });
               if (foundInCategory) {
                  $(this).show();
                  foundAny = true;
               } else {
                  $(this).hide();
               }
            });
         }

         $noResult.toggle(!foundAny);
      });

      // Keyboard navigation
      $searchInput.on('keydown', function (e) {
         var $visibleOptions = isSingle ?
            $optionsContainer.find('.option:visible') :
            $optionsContainer.find('.sub-options .option:visible');
         if (!$visibleOptions.length) return;

         if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!$hoveredOption || !$hoveredOption.length) $hoveredOption = $visibleOptions.first();
            else {
               var idx = $visibleOptions.index($hoveredOption);
               $hoveredOption.removeClass('hovered');
               $hoveredOption = $visibleOptions.eq((idx + 1) % $visibleOptions.length);
            }
            $visibleOptions.removeClass('hovered');
            $hoveredOption.addClass('hovered');
            scrollToOption($hoveredOption);
         } else if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!$hoveredOption || !$hoveredOption.length) $hoveredOption = $visibleOptions.last();
            else {
               var idx = $visibleOptions.index($hoveredOption);
               $hoveredOption.removeClass('hovered');
               $hoveredOption = $visibleOptions.eq((idx - 1 + $visibleOptions.length) % $visibleOptions.length);
            }
            $visibleOptions.removeClass('hovered');
            $hoveredOption.addClass('hovered');
            scrollToOption($hoveredOption);
         } else if (e.key === "Enter") {
            e.preventDefault();
            if ($hoveredOption && $hoveredOption.length) {
               var val = $hoveredOption.data('value');
               if (isSingle) {
                  selected = val;
                  $optionsContainer.hide();
               } else if ($.inArray(val, selected) === -1) {
                  selected.push(val);
                  $optionsContainer.hide(); // close dropdown after selection
               }
               updateSelected();
            }
         }
      });

      function scrollToOption($option) {
         var container = $optionsContainer.get(0);
         var top = $option.position().top + container.scrollTop;
         var height = $option.outerHeight();
         if (top < container.scrollTop) container.scrollTop = top;
         else if (top + height > container.scrollTop + $optionsContainer.height()) {
            container.scrollTop = top + height - $optionsContainer.height();
         }
      }

      $(document).click(function () {
         $optionsContainer.hide();
      });

      updateSelected();
   });

});

$(window).scroll(function () {
   if ($(window).scrollTop() >= 300) {
      $('.inner-header').addClass('fixed-header');
   } else {
      $('.inner-header').removeClass('fixed-header');
   }
});


$(function () {
   var leave = $(".leave");
   var ret = $(".return");

   leave.datepicker({
      dateFormat: "dd-mm-yy",
      minDate: 0, // today or later
      onSelect: function (selectedDate) {
         var minReturn = leave.datepicker("getDate");
         minReturn.setDate(minReturn.getDate() + 1); // at least 1 day after leave
         ret.datepicker("option", "minDate", minReturn);
      }
   });

   ret.datepicker({
      dateFormat: "dd-mm-yy",
      minDate: 1 // tomorrow or later
   });
});








document.addEventListener('DOMContentLoaded', function() {

  // --- TAB HANDLER ---
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', function() {
      const tab = btn.getAttribute('data-tab');

      // remove active from all buttons and panes
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      document.getElementById(tab).classList.add('active');
    });
  });

  // --- DROPDOWN HANDLERS ---
  function updateSelectedItems(dropdown) {
    const selectedOptions = Array.from(dropdown.querySelectorAll('.option.selected'))
      .map(o => o.innerText);
    dropdown.querySelector('.selected-items').innerText = selectedOptions.join(', ');
  }

  // Multi-select
  document.querySelectorAll('.multi-select-dropdown .option').forEach(option => {
    option.addEventListener('click', function() {
      option.classList.toggle('selected');
      updateSelectedItems(option.closest('.select-box'));
    });
  });

  // Single-select
  document.querySelectorAll('.single-select-dropdown .option').forEach(option => {
    option.addEventListener('click', function() {
      const dropdown = option.closest('.select-box');
      dropdown.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
      updateSelectedItems(dropdown);
    });
  });

  // --- EDIT HANDLER ---
  const savedData = JSON.parse(localStorage.getItem('travelData'));
  const editFormId = savedData?.formId;

  if (editFormId) {
    const form = document.getElementById(editFormId);
    if (form) {
      // Activate the correct tab
      const tabId = form.closest('.tab-pane').id;
      tabButtons.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));
      document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
      document.getElementById(tabId).classList.add('active');

      // Fill inputs
      form.querySelector('.leave').value = savedData.leave || '';
      form.querySelector('.return').value = savedData.ret || '';
      form.querySelector('.counter').value = savedData.age || '';
      form.querySelector('.promo-code input').value = savedData.promo || '';

      // Fill dropdown
      const dropdown = form.querySelector('.dropdown .select-box');
      if (dropdown && savedData.destination) {
        const values = savedData.destination.split(',').map(v => v.trim());
        dropdown.querySelectorAll('.option').forEach(opt => {
          if (values.includes(opt.innerText)) {
            opt.classList.add('selected');
          } else {
            opt.classList.remove('selected');
          }
        });
        updateSelectedItems(dropdown);
      }

      // Scroll to form
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // --- FORM SUBMIT ---
  ['travel', 'travel1'].forEach(id => {
    const form = document.getElementById(id);
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      const leave = form.querySelector('.leave')?.value || '';
      const ret = form.querySelector('.return')?.value || '';
      const age = form.querySelector('.counter')?.value || '';
      const promo = form.querySelector('.promo-code input')?.value || '';

      const dropdown = form.querySelector('.dropdown .select-box');
      let destination = '';
      if (dropdown) {
        const selectedOptions = dropdown.querySelectorAll('.option.selected');
        destination = Array.from(selectedOptions).map(o => o.innerText).join(', ');
      }

      localStorage.setItem('travelData', JSON.stringify({
        formId: form.id,
        destination,
        leave,
        ret,
        age,
        promo
      }));

      window.location.href = 'display.html';
    });
  });

});




// Fill dropdown
const dropdown = form.querySelector('.dropdown .select-box');
if (dropdown && savedData.destination) {
  const values = savedData.destination.split(',').map(v => v.trim());
  dropdown.querySelectorAll('.option').forEach(opt => {
    if (values.includes(opt.innerText)) {
      opt.classList.add('selected');
    } else {
      opt.classList.remove('selected');
    }
  });

  // Update selected-items div
  updateSelectedItems(dropdown);

  // ✅ Set input box value too
  const inputBox = dropdown.querySelector('.search-input');
  if (inputBox) {
    inputBox.value = values.join(', ');
  }
}



// --- EDIT HANDLER ---
const savedData = JSON.parse(localStorage.getItem('travelData'));
const editFormId = savedData?.formId;

if (editFormId) {
  const form = document.getElementById(editFormId);
  if (form) {
    // Activate the correct tab
    const tabId = form.closest('.tab-pane').id;
    tabButtons.forEach(b => b.classList.remove('active'));
    tabPanes.forEach(p => p.classList.remove('active'));
    document.querySelector(`.tab-btn[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(tabId).classList.add('active');

    // Fill inputs
    form.querySelector('.leave').value = savedData.leave || '';
    form.querySelector('.return').value = savedData.ret || '';
    form.querySelector('.counter').value = savedData.age || '';
    form.querySelector('.promo-code input').value = savedData.promo || '';

    // Fill dropdown
    const dropdown = form.querySelector('.dropdown .select-box');
    if (dropdown && savedData.destination) {
      const values = savedData.destination.split(',').map(v => v.trim());
      dropdown.querySelectorAll('.option').forEach(opt => {
        if (values.includes(opt.innerText)) {
          opt.classList.add('selected');
        } else {
          opt.classList.remove('selected');
        }
      });

      // Update selected-items div
      updateSelectedItems(dropdown);

      const inputBox = dropdown.querySelector('.search-input');
      if (inputBox) {
        inputBox.value = values.join(', ');
      }
    }

    // Scroll to form
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

















