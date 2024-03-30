(function ($) {
    $.fn.peater = function () {
        const peater = {
            elements: {},
            peaters: {},

            init(element) {
                console.log('Peater initialized');
                this.indexPeaters(element);
                this.beautifyInitialTextareaContent();
                this.buildPeaters();
                this.bindEventHandlersToExistingElements();
            },

            beautifyInitialTextareaContent() {
                $.each(this.peaters, (index, peater) => {
                    const data = JSON.parse($(peater).val());
                    const beautifiedJson = js_beautify(JSON.stringify(data), { indent_size: 2 });
                    $(peater).val(beautifiedJson);
                });
            },

            indexPeaters(element) {
                $(element).each((index, el) => {
                    this.peaters[index] = el;
                });
            },

            buildPeaters() {
                $.each(this.peaters, (index, peater) => {
                    const data = JSON.parse($(peater).val());
                    $.each(data.peaters, (i, item) => {
                        const row = this.createRow(i, item.value);
                        $(peater).after(row);
                    });
                    this.bindEventHandlersToExistingElements();
                    this.checkRowCountAndToggleDeleteButtons();
                });
            },

            createRow(index, value) {
                const row = $(`<div class="peater-row"></div>`).attr('data-index', index);
                const textarea = $(`<textarea></textarea>`).val(value);
                const deleteButton = $(`<button class="peater-delete-row">Delete</button>`);
                const addButton = $(`<button class="peater-add-row">Add</button>`);
                row.append(textarea, deleteButton, addButton);
                return row;
            },

            bindEventHandlersToExistingElements() {
                this.bindInputHandlerToTextarea();
                this.bindClickHandlerToDeleteButton();
                this.bindClickHandlerToAddButton();
            },

            bindInputHandlerToTextarea() {
                $('.peater-row textarea').off('input').on('input', () => {
                    this.updateTextarea();
                });
            },

            bindClickHandlerToDeleteButton() {
                $('.peater-delete-row').off('click').on('click', (event) => {
                    const index = $(event.currentTarget).parent().data('index');
                    this.deleteRow(index);
                });
            },

            bindClickHandlerToAddButton() {
                $('.peater-add-row').off('click').on('click', (event) => {
                    const index = $(event.currentTarget).parent().data('index');
                    this.addRow(index);
                });
            },

            updateTextarea() {
                $.each(this.peaters, (index, peater) => {
                    const data = {
                        peaters: []
                    };
                    $(peater).nextAll('.peater-row').each((i, row) => {
                        const value = $(row).find('textarea').val();
                        data.peaters.push({
                            type: 'textarea',
                            value: value
                        });
                    });
                    const beautifiedJson = js_beautify(JSON.stringify(data), { indent_size: 2 });
                    $(peater).val(beautifiedJson);
                });
            },

            checkRowCountAndToggleDeleteButtons() {
                $.each(this.peaters, (index, peater) => {
                    const rows = $(peater).nextAll('.peater-row');
                    if (rows.length === 1) {
                        rows.find('.peater-delete-row').prop('disabled', true);
                    } else {
                        rows.find('.peater-delete-row').prop('disabled', false);
                    }
                });
            },

            deleteRow(id) {
                $(`.peater-row[data-index="${id}"]`).remove();
                this.updateTextarea();
                this.checkRowCountAndToggleDeleteButtons();
            },

            addRow(id) {
                const row = this.createRow(id + 1, '');
                $(`.peater-row[data-index="${id}"]`).last().after(row);
                this.bindInputHandlerToTextarea();
                this.bindClickHandlerToDeleteButton();
                this.bindClickHandlerToAddButton();
                this.updateTextarea();
                this.checkRowCountAndToggleDeleteButtons();
            },
        };

        return this.each(function () {
            peater.init(this);
        });
    };
})(jQuery);
