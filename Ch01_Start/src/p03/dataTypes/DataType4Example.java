package p03.dataTypes;
/**
 * -.16진수표기: '0x'로 시작 
 * -.8진수표기: '0'으로 시작 
 **/
public class DataType4Example {
	public static void main(String[] args) {
		boolean varb = true;
		byte bar_byte = 127; //-128 ~ 127
		short var_short = 32767; // 
		char var_char = 66; //0 ~ 65536
		System.out.println(var_char); //B
		char var_char1 = 'A';
		char var_char31 = '가'; //char타입에 값입력시 '가'입력 or 해당 unicode입력해도 동일한 결과나옴
		char var_char32 = '\uac00';
		System.out.println("var_char31= " + var_char31);
		System.out.println("var_char32= " + var_char32);
		System.out.println("한글");
		System.out.println('\ud55c'); //2byte표기(유니코드)  1101010101011100
		System.out.println('\uae00'); //2byte표기 1010111000000000
		
		
	}
}
