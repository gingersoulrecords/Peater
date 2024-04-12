(function ($) {
    $.fn.peater = function (options) {
        const peater = {
            elements: {},
            peaterRows: {},


            init(element) {
                console.log('Peater initialized');
                //this.indexPeaters(element);
                this.indexPeaterRows(element);

                this.checkTextareaContentAndPopulateIfEmpty(options);

                this.beautifyInitialTextareaContent();
                //this.buildPeaters();
                this.buildPeaterRows();

                this.bindEventHandlersToExistingElements();
            },

            checkTextareaContentAndPopulateIfEmpty(options) {
                $.each(this.peaterRows, (index, peaterRow) => {
                    if (!$(peaterRow).val()) {
                        const jsonData = JSON.stringify(options);
                        $(peaterRow).val(jsonData);
                    }
                });
            },

            beautifyInitialTextareaContent() {
                $.each(this.peaterRows, (index, peaterRow) => {
                    const data = JSON.parse($(peaterRow).val());
                    const beautifiedJson = js_beautify(JSON.stringify(data), { indent_size: 2 });
                    $(peaterRow).val(beautifiedJson);
                });
            },

            indexPeaterRows(element) {
                $(element).each((index, el) => {
                    this.peaterRows[index] = el;
                });
            },

            buildPeaterRows() {
                $.each(this.peaterRows, (index, peaterRow) => {
                    const data = JSON.parse($(peaterRow).val());
                    data.peaterRows.reverse(); // Reverse the order of the peaterRows array
                    $.each(data.peaterRows, (i, item) => {
                        const row = this.createRow(i, item); // Pass `item` instead of `item.value`
                        $(peaterRow).after(row);
                    });
                    this.bindEventHandlersToExistingElements();
                    this.checkRowCountAndToggleDeleteButtons();
                });
            },

            createRow(index, peaterRow) {
                const row = $(`<div class="peater-row"></div>`).attr('data-index', index);
                $.each(peaterRow.fields, (i, field) => {
                    const name = field.label.toLowerCase().replace(/\s+/g, '-') + '-' + index;
                    const formField = $(`<${field.type}></${field.type}>`)
                        .attr('name', name)
                        .attr('id', name)
                        .val(field.value);
                    const label = $(`<label></label>`)
                        .attr('for', name)
                        .text(field.label);
                    row.append(label, formField);
                });
                const deleteButton = $(`<button class="peater-delete-row">Delete</button>`);
                const addButton = $(`<button class="peater-add-row">Add</button>`);
                row.append(deleteButton, addButton);
                return row;
            },

            bindEventHandlersToExistingElements() {
                this.bindInputHandlerToFields();
                this.bindClickHandlerToDeleteButton();
                this.bindClickHandlerToAddButton();
            },

            bindInputHandlerToFields() {
                $('.peater-row').find('input, textarea').off('input').on('input', () => {
                    this.updateJsonFromFields();
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

            updateJsonFromFields() {
                $.each(this.peaterRows, (index, peaterRow) => {
                    const data = {
                        peaterRows: []
                    };
                    $(peaterRow).nextAll('.peater-row').each((i, row) => {
                        const rowData = {
                            fields: []
                        };
                        $(row).find('input, textarea').each((j, field) => {
                            const label = $(`label[for='${field.name.toLowerCase()}']`).first().text();
                            const fieldData = {
                                label: label,
                                type: field.tagName.toLowerCase(),
                                value: field.value,
                            };
                            rowData.fields.push(fieldData);
                        });
                        data.peaterRows.push(rowData);
                    });
                    const beautifiedJson = js_beautify(JSON.stringify(data), { indent_size: 2 });
                    $(peaterRow).val(beautifiedJson);
                });
            },

            checkRowCountAndToggleDeleteButtons() {
                $.each(this.peaterRows, (index, peaterRow) => {
                    const rows = $(peaterRow).nextAll('.peater-row');
                    if (rows.length === 1) {
                        rows.find('.peater-delete-row').prop('disabled', true);
                    } else {
                        rows.find('.peater-delete-row').prop('disabled', false);
                    }
                });
            },

            deleteRow(id) {
                $(`.peater-row[data-index="${id}"]`).remove();
                this.updateJsonFromFields();
                this.checkRowCountAndToggleDeleteButtons();
            },

            addRow(id) {
                const firstRow = $('.peater-row').first();
                const newRowData = {
                    fields: []
                };
                firstRow.find('input, textarea').each((i, field) => {
                    const label = $(`label[for='${field.name.toLowerCase()}']`).first().text();
                    const fieldData = {
                        label: label,
                        type: field.tagName.toLowerCase(),
                        value: ''
                    };
                    newRowData.fields.push(fieldData);
                });
                const row = this.createRow(id + 1, newRowData);
                $(`.peater-row[data-index="${id}"]`).after(row);
                this.bindInputHandlerToFields();
                this.bindClickHandlerToDeleteButton();
                this.bindClickHandlerToAddButton();
                this.updateJsonFromFields();
                this.checkRowCountAndToggleDeleteButtons();
            },
        };

        return this.each(function () {
            peater.init(this);
        });
    };
})(jQuery);
