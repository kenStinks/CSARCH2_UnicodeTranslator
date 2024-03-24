//jquery when the document is ready
$(document).ready(function(){
    console.log('script.js is loaded');
    
    const button = $('#translate_button');
    const input_select = $('#input_type');
    const output_select = $('#output_type');

    button.on('click', function(){
        console.log('button clicked');
        const input_type = input_select.val();
        const input_text = $('#input_text').val();
        const output_type = output_select.val();

        console.log(input_type);
        console.log(input_text);
        console.log(output_type);

        //validate inputs first before converting
        
        //after validating, this is where we call our functions that convert/translate Unicode/UTF
        //based on the input and output types

        if(input_type == 'unicode' && output_type.startsWith('utf')){
            console.log('converting unicode to ' + output_type);
            const result = convert(input_text, output_type);
            $('#output_text').val(result);
        }  else if(input_type.startsWith('utf') && output_type == 'unicode'){
            console.log('translating ' + input_type + ' to unicode');
            const result = translate(input_type, input_text);
            //$('#output_text').val(result);
        } else {
            console.log('invalid input/output types');
        }
    });

    //change available output type options based on selected input type
    input_select.on('change', function(){
        const input_type = input_select.val();
        console.log('input changed to ' + input_type);

        var first_option = false

        $("#output_type > option").each(function() {
            //if input is unicode, hide unicode output. if UTF, hide all UTF.
            var hidden = !((input_type == 'unicode') ^ (this.value == 'unicode'))
            this.hidden = hidden;
            
            //select the first non-hidden option
            if (!(hidden || first_option)) {
                first_option = true;
                this.selected = true;
            } else {
                this.selected = false;
            }
        });

    });

    //run the above function on startup.
    input_select.trigger('change');
    
});

function clear_steps(){
    $('#step_list').empty()
}

function print_step(str){
    var step = $("<li></li>").text(str); 
    $('#step_list').append(step);
}

function convert(unicode, utf_type){
    //insert code

    //check if input is valid
    let regex = /^[0-9a-f]+$/i;

    if(!regex.test(unicode)){
        return "Invalid Input.";
    }

    unicode = unicode.toUpperCase(); //make unicode string uppercase

    clear_steps();
    print_step('Input Unicode: '+unicode);

    return "Valid Input";
}

function translate(utf_type, utf) {
    //insert code
}
