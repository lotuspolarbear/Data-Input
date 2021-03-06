var agentEditable = function () {

    var handleTable = function () {

        function restoreRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);

            for (var i = 0, iLen = jqTds.length; i < iLen; i++) {
                oTable.fnUpdate(aData[i], nRow, i, false);
            }

            oTable.fnDraw();
        }

        function editRow(oTable, nRow) {
            var aData = oTable.fnGetData(nRow);
            var jqTds = $('>td', nRow);
            jqTds[0].innerHTML = '<input type="text" class="form-control" style="width: 100px;" value="' + aData[0] + '">';
            jqTds[1].innerHTML = '<input type="text" class="form-control" style="width: 170px;" value="' + aData[1] + '">';
            jqTds[2].innerHTML = '<input type="number" min="0" class="form-control right-align" style="width: 100px;" value="' + aData[2] + '">';
            jqTds[3].innerHTML = '<input type="number" min="0" class="form-control right-align" style="width: 100px;" value="' + aData[3] + '">';
            jqTds[4].innerHTML = selectActive(aData[4]);
            jqTds[5].innerHTML = '<a class="save" href="">บันทึก</a>';
            jqTds[6].innerHTML = '<a class="cancel" href="">ยกเลิก</a>';
        }

        function selectActive(activeName){
            var output = '<select class="select-active" style="height:34px;">';

            if(activeName == 'ผิด'){
                output += '<option selected value="0">' + activeName + '</option>'; 
                output += '<option value="1">' + "ถูก" + '</option>';  
            } else if(activeName == "ถูก"){
                output += '<option selected value="1">' + activeName + '</option>';  
                output += '<option value="0">' + "ผิด" + '</option>'; 
            } 
            output += '</select>';

            return output;
        }

        function saveRow(oTable, nRow) {
            var jqInputs = $('input', nRow);
            var jqSelects=$('select.select-active', nRow);
            if(jqSelects[0].value == 0){
                var active = "ผิด";
            }else{
                var active = "ถูก";
            }

            if(jqInputs[2].value <= 0){
                var msg = "เครดิตต้องมากกว่า 0";
                var shortCutFunction = "error";
                var title = "เกิดข้อผิดพลาด";
                toastr[shortCutFunction](msg, title);
                $('#toast-container').addClass('animated shake');
            } else if(jqInputs[3].value != 30){
                var msg = "คอมมิชชั่นเริ่มต้นที่ 30";
                var shortCutFunction = "error";
                var title = "เกิดข้อผิดพลาด";
                toastr[shortCutFunction](msg, title);
                $('#toast-container').addClass('animated shake');
            } else {
                var agent_id = $(nRow).attr("agent_id");
                var data = {agent_name: jqInputs[0].value, email: jqInputs[1].value,
                            credit: jqInputs[2].value, commision: jqInputs[3].value,                            
                            active: jqSelects[0].value, agent_id: agent_id};
                $.ajax({
                    url : '/admin/settings/agentManagement/updateAgent',
                    type : 'post',
                    data : data,
                    success : function(response) {
                        if (response.state == false) {

                            var shortCutFunction = "error";
                            var msg = response.msg;
                            var title = "เกิดข้อผิดพลาด";
                            toastr[shortCutFunction](msg, title);
                            $('#toast-container').addClass('animated shake');
                        } else {
                            oTable.fnUpdate(jqInputs[0].value, nRow, 0, false);
                            oTable.fnUpdate(jqInputs[1].value, nRow, 1, false);
                            oTable.fnUpdate(jqInputs[2].value, nRow, 2, false);
                            oTable.fnUpdate(jqInputs[3].value, nRow, 3, false);
                            oTable.fnUpdate(active, nRow, 4, false);
                            oTable.fnUpdate('<a class="edit"><i class="fa fa-pencil">', nRow, 5, false);
                            oTable.fnUpdate('<a class="delete-agent" agent_name="'+jqInputs[0].value+'" agent_id="'+agent_id+'" href=""><i class="fa fa-trash"></i></a>', nRow, 6, false);
                            oTable.fnDraw();

                            var shortCutFunction = "success";
                            var msg = response.msg;
                            var title = "แจ้งเตือน!";
                            toastr[shortCutFunction](msg, title);
                            $('#toast-container').addClass('animated shake');
                        }
                    }
                });
            }            
        }

        var table = $('#sample_editable_agent');

        var oTable = table.dataTable({

            "lengthMenu": [
                [5, 10, 20, -1],
                [5, 10, 20, "All"] // change per page values here
            ],

            // Or you can use remote translation file
            //"language": {
            //   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
            //},

            // set the initial value
            "pageLength": 5,

            "language": {
                "lengthMenu": " _MENU_ records"
            },
            "columnDefs": [{ // set default column settings
                'orderable': true,
                'targets': [0]
            }, {
                "searchable": true,
                "targets": [0]
            }],
            "order": [
                [0, "asc"]
            ] // set first column as a default sort by asc
        });

        var tableWrapper = $("#sample_editable_agent_wrapper");

        var nEditing = null;
        var nNew = false;

        table.on('click', '.cancel', function (e) {
            e.preventDefault();
            if (nNew) {
                oTable.fnDeleteRow(nEditing);
                nEditing = null;
                nNew = false;
            } else {
                restoreRow(oTable, nEditing);
                nEditing = null;
            }
        });

        table.on('click', '.edit', function (e) {
            e.preventDefault();
            nNew = false;            
            /* Get the row as a parent of the link that was clicked on */
            var nRow = $(this).parents('tr')[0];

            if (nEditing !== null && nEditing != nRow) {
                /* Currently editing - but not this row - restore the old before continuing to edit mode */
                restoreRow(oTable, nEditing);
                editRow(oTable, nRow);
                nEditing = nRow;
            } else {
                /* No edit in progress - let's start one */
                editRow(oTable, nRow);
                nEditing = nRow;
            }
        });

        table.on('click', '.save', function (e) {
            e.preventDefault();
            $('#toast-container').remove();
            saveRow(oTable, nEditing);                
        });

        table.on('click', 'a.delete-agent', function () {

            if(confirm("คุณต้องการลบบัญชีหัวหน่วยหรือไม่?")){
                
                $.ajax({
                    url : '/admin/settings/agentManagement/deleteAgent',
                    type : 'post',
                    data : {agent_id:$(this).attr('agent_id'), agent_name:$(this).attr('agent_name')},
                    success : function(response) { 
                            
                        if(response == "success") {
                            window.location.reload();                            
                        }else{
                            var msg = "เกิดข้อผิดพลาด";
                            var shortCutFunction = "error";
                            var title = "เกิดข้อผิดพลาด";
                            toastr[shortCutFunction](msg, title);
                            $('#toast-container').addClass('animated shake');
                        }
                    }
                });
            }
        });
    }

    return {

        //main function to initiate the module
        init: function () {
            handleTable();
        }

    };

}();
$(document).ready(function(){
    toastr.options = {
        closeButton: true,
        debug: false,
        positionClass: "toast-top-right",
        onclick: null,
        showDuration: "1000",
        hideDuration: "1000",
        timeOut: "5000",
        extendedTimeOut: "50000",
        showEasing: "swing",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
    };
    $('[data-toggle="tooltip"]').tooltip();
    agentEditable.init();

    $('.register-form').submit(function(e) {
        e.preventDefault();        
        $('#toast-container').remove();
        
        $.ajax({
            url : '/admin/settings/agentManagement/addAgent',
            type : 'post',
            data : $(this).serialize(),
            success : function(response) { 

                if (response.state == false) {
                    var msg = response.msg;
                    err_msg(msg);
                } else {
                    window.location.reload();
                }
            }
        });
    });

    function err_msg(msg){
        var shortCutFunction = "error";
        var title = "เกิดข้อผิดพลาด";
        toastr[shortCutFunction](msg, title);
        $('#toast-container').addClass('animated shake');
    }

    function notification_msg(msg){
        var shortCutFunction = "success";
        var title = "แจ้งเตือน!";
        toastr[shortCutFunction](msg, title);
        $('#toast-container').addClass('animated shake');
    }

});