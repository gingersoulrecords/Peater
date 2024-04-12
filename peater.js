(function ($) {
    $.fn.peater = function (options) {
        const peater = {
            elements: {},
            peaters: {},

            init(element) {
                console.log('Peater initialized');
                this.indexPeaters(element);
                this.beautifyInitialTextareaContent();
                this.storePeaterData();
                this.buildPeaters();
                this.bindEventHandlersToExistingElements();
            },

            storePeaterData() {
                this.peaterData = {};
                $.each(this.peaters, (index, peater) => {
                    this.peaterData[index] = JSON.parse($(peater).val());
                });
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
                        const row = this.createRow(i, item); // Pass `item` instead of `item.value`
                        $(peater).after(row);
                    });
                    this.bindEventHandlersToExistingElements();
                    this.checkRowCountAndToggleDeleteButtons();
                });
            },

            createRow(index, peater) {
                const row = $(`<div class="peater-row"></div>`).attr('data-index', index);
                $.each(peater.fields, (i, field) => {
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

            // updateJsonFromFields() {
            //     $.each(this.peaters, (index, peater) => {
            //         const data = {
            //             peaters: []
            //         };
            //         $(peater).nextAll('.peater-row').each((i, row) => {
            //             const rowData = {
            //                 fields: []
            //             };
            //             $(row).find('input, textarea').each((j, field) => {
            //                 console.log(field);
            //                 const fieldData = {
            //                     type: field.tagName.toLowerCase(),
            //                     name: field.name,
            //                     value: field.value,
            //                     label: $(`label[for='${field.name.toLowerCase()}']`).text(),


            //                 };
            //                 rowData.fields.push(fieldData);
            //             });
            //             data.peaters.push(rowData);
            //         });
            //         const beautifiedJson = js_beautify(JSON.stringify(data), { indent_size: 2 });
            //         $(peater).val(beautifiedJson);
            //     });
            // },

            updateJsonFromFields() {
                $.each(this.peaters, (index, peater) => {
                    const data = {
                        peaters: []
                    };
                    $(peater).nextAll('.peater-row').each((i, row) => {
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
                        data.peaters.push(rowData);
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
                this.updateJsonFromFields();
                this.checkRowCountAndToggleDeleteButtons();
            },

            addRow(id) {
                const blueprint = this.peaterData[0].peaters[0]; // Use the first peater's data as the blueprint
                const newRowData = {
                    fields: []
                };
                $.each(blueprint.fields, (i, field) => {
                    const name = field.label.toLowerCase().replace(/\s+/g, '-') + '-' + (id + 1);
                    const fieldData = {
                        type: field.type,
                        name: name,
                        label: field.label,
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
