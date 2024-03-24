//jquery when the document is ready
$(document).ready(function(){
    console.log('script.js is loaded');
    
    const button = $('#translate_button');

    button.on('click', function(){
        console.log('button clicked');
        const input_type = $('#input_type').val();
        const input_text = $('#input_text').val();
        const output_type = $('#output_type').val();

        console.log(input_type);
        console.log(input_text);
        console.log(output_type);

        //validate inputs first before converting
        

        //after validating, this is where we call our functions that convert/translate Unicode/UTF
        //based on the input and output types

        if(input_type == 'unicode' && output_type.startsWith('utf')){
            console.log('converting unicode to ' + output_type);
            const result = convert(input_text, output_type);
            //$('#output_text').val(result);
        }  else if(input_type.startsWith('utf') && output_type == 'unicode'){
            console.log('translating ' + input_type + ' to unicode');
            const result = translate(input_type, input_text);
            //$('#output_text').val(result);
        } else {
            console.log('invalid input/output types');
        }
    });
});

function convert(unicode, utf_type){
    //insert code
}

function translate(utf_type, utf) {
    //insert code
}
