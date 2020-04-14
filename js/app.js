;( function( $, window, document, undefined )
{
    var executeFunctionByName = function(functionName, context /*, args */) {
        var args = Array.prototype.slice.call(arguments, 2);
        var namespaces = functionName.split(".");
        var func = namespaces.pop();
        for (var i = 0; i < namespaces.length; i++) {
            context = context[namespaces[i]];
        }
        return context[func].apply(context, args);
    }
    
	$( '.inputfile' ).each( function()
	{
		var $input	 = $( this ),
			$label	 = $input.next( 'label' ),
			labelVal = $label.html();

		$input.on( 'change', function( e )
		{
			var fileName = '';

			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else if( e.target.value )
				fileName = e.target.value.split( '\\' ).pop();

                        if($input.data("callback")){
                          executeFunctionByName($input.data("callback"), window, $input, this.files, fileName);
                        } 
                        
                        if( fileName )
                                $label.find( 'span' ).html( fileName );
                        else
                                $label.html( labelVal );
                        

		});

		// Firefox bug fix
		$input
		.on( 'focus', function(){ $input.addClass( 'has-focus' ); })
		.on( 'blur', function(){ $input.removeClass( 'has-focus' ); });
	});
})( jQuery, window, document );

function selectFile($input, files, filename){
    $("#fileform #d").val("");
    $("#fileform #n").val("");
    $("#instructionMessage").hide();
    var btn = $("#fileform .btn");
    btn.each(function(index) {
        $(this).on("click", function(e) {
            if (files && files.length > 0) {
                $("#instructionsMessage").show();
            }
        });
        $(this).removeClass("btn-primary");
        this.previousText = this.textContent;
        this.textContent = "Espera un momento...";
    });

    if(!files || files.length == 0){
        return;
    }
    
    $("#reqireMessage").hide();
    
    /*set name*/
    $("#fileform #n").val(filename);
    
    var temp_reader = new FileReader();
    temp_reader.onload =
    function(event)
    {
        var fileBuffer = event.target.result;
        var hash = sha512.create();
        hash.update(fileBuffer);
        var file_hash = hash.hex();
        $("#fileform #d").val(file_hash);
        //$("#file-1-hash").html(file_hash.replace(/(.{48})/g, "$1 "));
        var btn = $("#fileform .btn");
        btn.each(function(index) {
            $(this).addClass("btn-primary");
            this.textContent = this.previousText;
        });
    };

    temp_reader.readAsArrayBuffer(files[0]);
}

var verifirer = {
    files: {
        tsq: null,
        tsr: null
    },
    
    selectFileTSQ: function($input, files, filename){
        if(!files || files.length == 0){
            this.files.tsq = null;
            return;
        }
        
        this.files.tsq = files[0];
    },
    selectFileTSR: function($input, files, filename){
        if(!files || files.length == 0){
            this.files.tsr = null;
            return;
        }
        
        this.files.tsr = files[0];
    },
    verify: function(){
        var me = this;
        $("#messageError2").hide();
        $("#divVerifyInfo").html("");
        $("#divVerifyStatus").hide();
        $("#divVerifyStatus").removeClass("alert-success");
        $("#divVerifyStatus").removeClass("alert-warning");
        $("#divVerifyStatus").addClass("alert-info");
        
        $("#reqireMessage2").hide();
        $("#messageWait2").show();
        
        var data = {
            tsq: null,
            tsr: null
        };
        
        var temp_reader_tsq = new FileReader();
        temp_reader_tsq.onload =
        function(event)
        {
            data.data = event.target.result;
            data.m = "verify";
            $.ajax({
                url: "/verify",
                data: data,
                method: 'POST',
                success: function(res){
                    if(!res.success){
                        $("#messageWait2").hide();
                        $("#messageError2").show();
                        return;
                    }
                    
                    $("#messageWait2").hide();
                    $("#divVerifyInfo").html(res.info);
                    
                    $("#divVerifyStatus").show();
                    $("#divVerifyStatus").html(res.verify);
                    
                    $("#divVerifyStatus").removeClass("alert-info");
                    if(res.verify == "Verificación: OK"){
                        $("#divVerifyStatus").addClass("alert-success");
                    } else {
                        $("#divVerifyStatus").addClass("alert-danger")
                    }
                    
                },
                error: function(){
                    $("#messageWait2").hide();
                    $("#messageError2").show();
                }
               });

        };
        temp_reader_tsq.readAsDataURL(this.files.tsq);       
    }
}

$(document).ready(function(){
    
    $("form[data-event='submitStamp']").on("submit", function(e){
        $("#reqireMessage").hide();
    
        if($("#fileform #d").val().length == 0){
            $("#reqireMessage").show();
            e.preventDefault();
        }
    })
    
    $("a[data-event='verify']").on("click", function(e){
        verifirer.verify();
    });
    
    var sendContactForm = function(e){
        e.preventDefault();
        var form = this;
        var data = $( form ).serializeArray();
        $(".alert", form).addClass("hide");
         
        $.ajax({
            url: "webservice.php",
            data: data,
            method: 'POST',
            success: function(res){
                if(res.success){
                    $(".alert-success", form).removeClass("hide");
                    $("input", form).val("");
                    $("textarea", form).val("");
                    return;
                }
                
                $(".alert-warning", form).removeClass("hide");
            },
            error: function(){
                $(".alert-danger", form).removeClass("hide");
            }
            
        });
      
    };
    $("#form-contact").submit(sendContactForm);
});