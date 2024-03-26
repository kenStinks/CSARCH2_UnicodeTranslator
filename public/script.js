//jquery when the document is ready
$(document).ready(function(){
    console.log('script.js is loaded');
    
    const button = $('#translate_button');
    const save = $('#export_button');
    const flip = $('#arrow');

    const input_select = $('#input_type');
    const input_box = $('#input_text');

    const output_select = $('#output_type');
    const output_box = $('#output_text');

    button.on('click', function(){
        console.log('button clicked');
        var input_type = input_select.val();
        var input_text = input_box.val();
        var output_type = output_select.val();

        console.log(input_type);
        console.log(input_text);
        console.log(output_type);

        //validate inputs first before converting
        
        //check if input is valid
        input_text = input_text.replace(/\s/g, ''); //remove spaces
        const regex = /^[0-9a-f]+$/i; //ensures hex input

        if(!regex.test(input_text)){
            clear_steps();
            output_box.val('Invalid Input');
            return;
        }

        input_text = input_text.toUpperCase(); //make hex string uppercase

        //after validating, this is where we call our functions that convert/translate Unicode/UTF
        //based on the input and output types

        if(input_type == 'unicode' && output_type.startsWith('utf')){
            console.log('converting unicode to ' + output_type);
            const result = convert(input_text, output_type);
            output_box.val(result);
        }  else if(input_type.startsWith('utf') && output_type == 'unicode'){
            console.log('translating ' + input_type + ' to unicode');
            const result = translate(input_text, input_type);
            output_box.val(result);
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

    flip.on('click', function(){
        var input_type = input_select.val();
        var input_text = input_box.val();
        var output_type = output_select.val();
        var output_text = output_box.val();

        input_select.val(output_type);
        input_box.val(output_text);

        output_select.val(input_type);
        output_box.val(input_text);

        input_select.trigger('change'); //update options
    });

});

//HELPER FUNCTIONS

function clear_steps(){
    $('#step_list').empty()
}

function print_step(str){
    var step = $("<li></li>").text(str); 
    $('#step_list').append(step);
}

function dec_to_bin(x){
    var n = x.toString(2)

    while(n.length%4 != 0) {
        n = "0" + n;
    }

    return n.match(/.{1,4}/g).join(' ');
}

function dec_to_hex(x){
    var n = x.toString(16)

    while(n.length%2 != 0) {
        n = "0" + n;
    }

    return n.match(/.{1,2}/g).join(' ').toUpperCase();
}

function hex_to_dec(x){
    return parseInt(x, 16);
}

//CONVERSION
function convert(unicode, utf_type){

    clear_steps();
    print_step('Input Unicode: '+unicode);

    //tests if unicode is in valid range
    const decimal = parseInt(unicode, 16);
    if(decimal < 0 || decimal > 0x10FFFF){
        return "Input Out of Range";
    }
    
    switch(utf_type){
        case 'utf_8':
            return uni_to_utf8(unicode);
        case 'utf_16':
            return uni_to_utf16(unicode);
        case 'utf_32':
            return uni_to_utf32(unicode);
        default:
            return -1;
    }
}

//functions for converting Unicode to UTF
function uni_to_utf8(unicode){
    //convert unicode to utf8
    
    //convert to decimal
    const decimal = hex_to_dec(unicode);

    console.log("decimal: "+decimal+" | packed bcd: " + dec_to_bin(decimal));
    
    //if 1 byte is needed, leave as is.
    if (decimal <= 0x007F){
        print_step(`0000 <= ${unicode} <= 007F : needs 1 byte`);
        print_step(`Convert to binary → ${dec_to_bin(decimal)}`);

        var hex = hex = dec_to_hex(decimal)
        print_step(`Byte 1: 0xxx xxxx → ${dec_to_bin(decimal)}`);
        print_step(`Convert back to hex: ${hex}`);

        return hex;
    };

    var n=0;
    if(decimal <= 0x07FF){
        print_step(`0080 <= ${unicode} <= 07FF : needs 2 bytes`);
        n=2;
    } else if(decimal <= 0xFFFF) {
        print_step(`0800 <= ${unicode} <= FFFF : needs 3 bytes`);
        n=3
    } else {
        print_step(`010000 <= ${unicode} <= 10FFFF : needs 4 bytes`);
        n=4
    }

    print_step(`Convert to binary → ${dec_to_bin(decimal)}`);
    
    var hex = ''
    var res = ''
    var first_byte = 1;

    //compute trailing bytes
    for(let i=0; i<n-1; i++){
        var binary = 0b10000000;
        binary += decimal>>(6*i) & 0b111111
        
        res = dec_to_bin(binary)+" "+ res;
        hex = dec_to_hex(binary)+" "+ hex;

        print_step(`Byte ${n-i}: 10xx xxxx → ${dec_to_bin(binary)}`);
        first_byte = (first_byte << 1) + 1
    }

    //then the first byte
    byte_mask = (first_byte<<1).toString(2).slice(0, 4);
    while(byte_mask.length < 4) byte_mask+='x';

    first_byte <<= 8-n;
    first_byte += decimal>>(6*(n-1));
    print_step(`Byte 1: ${byte_mask} xxxx → ${dec_to_bin(first_byte)}`);

    res = dec_to_bin(first_byte)+" "+ res;
    hex = dec_to_hex(first_byte)+" "+ hex;

    print_step(`Final Answer: ${res}`);
    print_step(`Convert back to hex → ${hex}`);
    
    return hex;
}

function uni_to_utf16(unicode){
    //convert unicode to utf16
    let decimal = hex_to_dec(unicode);
    if (decimal <= 0xffff){
        //represent as is
        print_step(`0000 <= ${unicode} <= FFFF : Represent as is.`);
        print_step("Final Answer: "+dec_to_hex(decimal));
        return dec_to_hex(decimal);
    } else {
        decimal -= 0x10000;
        print_step(`Subtract 10000 from ${unicode}: ` + dec_to_hex(decimal));

        print_step(`Convert to binary: ${dec_to_bin(decimal)}`); 

        let high = (decimal >> 10) & 0b1111111111;
        let low = decimal & 0b1111111111;

        print_step(`Split the binary into high and low values: ${dec_to_bin(high)} | ${dec_to_bin(low)}`);

        print_step(`Convert the high split to hex: ${dec_to_hex(high)}`);
        print_step(`Convert the low split to hex: ${dec_to_hex(low)}`);

        high +=0xD800;
        low +=0xDC00;

        print_step(`Add D800 to the high value: ${dec_to_hex(high)}`);
        print_step(`Add DC00 to the low value:  ${dec_to_hex(low)}`);

        let result = dec_to_hex(high) + ' ' + dec_to_hex(low);
        print_step(`Concatenate the high and low values: ${result}`);

        return result;
    }

}

function uni_to_utf32(unicode){
    //zero-extend unicode to 8 digits
    unicode = unicode.padStart(8, '0');
    unicode = unicode.match(/.{1,2}/g).join(' ');

    print_step("Zero-extend to 8 hex digits: "+unicode);
    return unicode;
}

//TRANSLATION
function translate(hex, utf_type){
    clear_steps();
    print_step('Input Hex: '+hex);
    
    switch(utf_type){
        case 'utf_8':
            return utf8_to_uni(hex);
        case 'utf_16':
            return utf16_to_uni(hex);
        case 'utf_32':
            return utf32_to_uni(hex);
        default:
            return -1;
    }
}

function bin_to_hex(bin){
    return parseInt(bin,2).toString(16).toUpperCase();
}

function utf8_to_uni(hex){
    var decimal = hex_to_dec(hex);
    var binary = decimal.toString(2);
    while(binary.length%8 != 0) {
        binary = "0" + binary;
    }

    print_step(`Convert to 8-bit binary: ${binary}`);

    re_1 = /^0[0-1]{7}$/g; //valid 1 byte
    re_2 = /^110[0-1]{5}10[0-1]{6}$/g; //valid 2 bytes
    re_3 = /^1110[0-1]{4}(10[0-1]{6}){2}$/g //valid 3 bytes
    re_4 = /^11110[0-1]{3}(10[0-1]{6}){3}$/g //valid 4 bytes

    if (binary.match(re_1)){
        print_step(`1 byte needed, leave as is: ${dec_to_hex(decimal)}`);
        return dec_to_hex(decimal);
    }

    var n = -1;

    if (binary.match(re_2)){
        print_step(`2 bytes needed, remove header bits.`);
        n=2;
    }

    if (binary.match(re_3)){
        print_step(`3 bytes needed, remove header bits.`);
        n=3;
    }

    if (binary.match(re_4)){
        print_step(`4 bytes needed, remove header bits.`);
        n=4;
    }

    if (n==-1) return 'Invalid Value';

    var result = binary.slice(n+1,8);

    for(let i=1;i<n;i++){
        result += binary.slice(i*8+2,i*8+8);
    }

    result = bin_to_hex(result);
    print_step(`Final Answer: ${result}`);
    print_step(`Convert to hex → ${result}`);
    return result;
}



function utf16_to_uni(hex){
    var decimal = hex_to_dec(hex);

    if(decimal <= 0xFFFF){
        print_step(`0000 <= ${hex} <= FFFF: Represent as is.`);
        print_step(`Final Answer: ${hex}`);
        return hex
    }

    hex = hex.padStart(8,'0');
    print_step(`10000 <= ${hex} <= 10FFFF.`);

    var high = hex.slice(0,4);
    var low = hex.slice(4,8);
    print_step(`Split to 2-byte segments → ${high}(high) | ${low}(low)`);

    high = hex_to_dec(high);
    low = hex_to_dec(low);

    //check if high/low are in a valid range
    if(high < 0xD800 || high > 0xDBFF){
        return 'Invalid Input'
    }

    if(low < 0xDC00 || low > 0xDFFF){
        return 'Invalid Input'
    }

    high -= 0xD800;
    low -= 0xDC00;

    print_step(`Subtract D800 from the high value: ${dec_to_hex(high)}`);
    print_step(`Subtract DC00 from the low value: ${dec_to_hex(low)}`);

    print_step(`Convert high value to binary → ${dec_to_bin(high)}`);
    print_step(`Convert low value to binary → ${dec_to_bin(low)}`);

    var result = (high << 10) + low;

    print_step(`Combine: ${dec_to_bin(result)}`);
    

    print_step(`Convert back to hex → ${dec_to_hex(result)}`);

    result = dec_to_hex(result+0x10000);
    print_step(`Add 10000: ${result}`);

    return result.replace(/^0+/, '').replace(/\s/g, '');
}

function utf32_to_uni(hex){
    var decimal = hex_to_dec(hex);

    if(decimal < 0 || decimal > 0x10FFFF){
        return "Input Out of Range";
    }
    var result = hex.replace(/^0+/, '');
    print_step(`Remove leading zeros: ${result}`);
    return result;
}