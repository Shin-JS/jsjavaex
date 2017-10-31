package p03.dataTypes;
/**
 *  데이터 타입
 *  변수에 값을 초기화 하기 위한 값 = 리터럴
 *  리터럴을 숫자로 표시할때,
 *  정수, 8진수, 16진수로 표기할 수 있음.
 *  자세한 사항은 어제(171026) 했음
 **/


public class DataType5Example {
	public static void main(String[] args) {
		int var1 = 10; //10진수 리터럴
		int var2 = 010; //8진수 리터럴→8*1+0*1
		int var3 = 0x10; //16진수 리터럴→16*1+0*1
		System.out.println("var1= " + var1);
		System.out.println("var2= " + var2);
		System.out.println("var3= " + var3);
		//32로 출력
		var1 = 32;  //10진법
		var2 = 040; //8진법
		var3 = 0x20; //16진법
		System.out.println("var1= " + var1);
		System.out.println("var2= " + var2);
		System.out.println("var3= " + var3);
		//10으로 출력
		int var4 = 10;  //10진법
		int var5 = 012; //8진법
		int var6 = 0xa; //16진법
		System.out.println("var4= " +var4);
		System.out.println("var5= " +var5);
		System.out.println("var6= " +var6);
		
	}
}
