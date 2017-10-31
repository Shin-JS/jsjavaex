package p03.dataTypes;
/**
 * 데이터 타입
 * -.기본 데이터 타입 
 *  
 **/
public class DataTypesExample {
	public static void main(String[] args) {
		//로컬변수 
		byte var1 = 127; //byte타입 - 길이 1byte
		char c = 'A'; //char타입 - 길이 2byte
		char c1 = '\u06a6'; //char타입의 값은 unicode로 지정해도 됨. 값은 unicode.org참고
		int a = 100; //int타입 - 길이 4byte
		double d = 34.53D; //double타입 - 길이 8byte
		
		System.out.println(var1+1); //byte타입의 값과 int타입의 값1의 연산결과임
		System.out.println(c);
		System.out.println(c1);
		System.out.println(a);
		System.out.println(d);
		//데이터 타입의 범위
		System.out.println(Byte.MIN_VALUE + "~byte타입의 값의 범위~"+Byte.MAX_VALUE  );
		System.out.println(Integer.MIN_VALUE + "~int타입의 값의 범위~" + Integer.MAX_VALUE);
		System.out.println(Double.MIN_VALUE+ "~double타입의 값의 범위 ~"+Double.MAX_VALUE);
		System.out.println(Float.MIN_VALUE+ "~float타입의 값의 범위 ~"+Float.MAX_VALUE);
		
		
		
	}
}
