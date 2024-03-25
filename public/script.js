//jquery when the document is ready
$(document).ready(function(){
    console.log('script.js is loaded');
    
    const button = $('#translate_button');
    const save = $('#export_button');

    const input_select = $('#input_type');
    const input_box = $('#input_text');

    const output_select = $('#output_type');
    const output_box = $('#output_text');

    button.on('click', function(){
        console.log('button clicked');
        const input_type = input_select.val();
        const input_text = input_box.val();
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
            output_box.val(result);
        }  else if(input_type.startsWith('utf') && output_type == 'unicode'){
            console.log('translating ' + input_type + ' to unicode');
            const result = translate(input_type, input_text);
            //output_box.val(result);
        } else {
            console.log('invalid input/output types');
        }
    });

    //save output
    save.on('click', function(){
        

        var pom = document.createElement('a');

        output = input_select.val() +': '+input_box.val() + ' → ' + output_select.val() +': ' + output_box.val();
        console.log(output);

        pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(output));
        pom.setAttribute('download', 'ouput.txt');

        pom.style.display = 'none';
        document.body.appendChild(pom);

        pom.click();

        document.body.removeChild(pom);
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

        output_box.val('');
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
    //check if input is valid
    unicode = unicode.replace(/\s/g, '');
    let regex = /^[0-9a-f]+$/i; //ensures hex input

    if(!regex.test(unicode)){
        clear_steps();
        return "Invalid Input";
    }

    //tests if unicode is in valid range
    let decimal = parseInt(unicode, 16);
    if(decimal < 0 || decimal > 0x10FFFF){
        clear_steps();
        return "Invalid Input";
    }

    unicode = unicode.toUpperCase(); //make unicode string uppercase

    clear_steps();
    print_step('Input Unicode: '+unicode);
    
    switch(utf_type){
        case 'utf_8':
            return utf8(unicode);
        case 'utf_16':
            return utf16(unicode);
        case 'utf_32':
            return utf32(unicode);
        default:
            return -1;
    }
}

//functions for converting Unicode to UTF
function utf8(unicode){
    //convert unicode to utf8
    unicode = "utf8 Not implemented yet!"

    return unicode;
}

function utf16(unicode){
    //convert unicode to utf16
    let decimal = parseInt(unicode, 16);
    if (decimal <= 0xffff){
        //represent as is
        print_step("Represent as is: "+unicode);
        return unicode;
    } else {
        //do the crazy stuff
        //STEP 1: subtract 0x10000
        let hex = decimal - 0x10000;
        print_step(`Subtract 0x10000 from ${unicode}: ` + hex.toString(16).toUpperCase());

        let binary = hex.toString(2);
        binary = binary.padStart(20, '0');

        print_step(`Convert to binary: ${binary.match(/.{1,4}/g).join(' ')}`); //added spaces for readability

        let high = binary.slice(0, 10);
        let low = binary.slice(10);

        print_step(`Split the binary into high and low values: ${high} (high) | ${low} (low)`);

        console.log(binary)
        let high_hex = Math.floor(hex / 0x400);
        let low_hex = hex % 0x400;

        print_step(`Convert the high split to hex: ${high_hex.toString(16).toUpperCase().padStart(4, '0')}`);
        print_step(`Convert the low split to hex: ${low_hex.toString(16).toUpperCase().padStart(4, '0')}`);

        high_hex +=0xD800;
        low_hex +=0xDC00;

        print_step(`Add 0xD800 to the high value: ${high_hex.toString(16).toUpperCase()}`);
        print_step(`Add 0xDC00 to the low value: ${low_hex.toString(16).toUpperCase()}`);

        let result = high_hex.toString(16).toUpperCase().padStart(4, '0') + ' ' + low_hex.toString(16).toUpperCase().padStart(4, '0') ;

        print_step(`Concatenate the high and low values: ${result}`);
        return result;
    }

}

function utf32(unicode){
    //zero-extend unicode to 8 digits
    unicode = unicode.padStart(8, '0');
    unicode = unicode.match(/.{1,4}/g).join(' ');

    print_step("Zero-extend to 8 hex digits: "+unicode);
    return unicode;
}
