package p03.methods;
/**[필드의 초기화]
 * 
 **/
public class Car2 {
	//정적필드
	static int field1;
	static void method1() {
		System.out.println("정적메소드");
	}
	
	//인스턴스 필드
	int field2;
	void method2() {
		System.out.println("인스턴스 메소드");
	}
	//인스턴스필드 초기화 블럭
	{
		field1 = 10;
		field2 = 10;
		method1();
		method2();
	}
	
	//정적필드 초기화 블럭
	static {
		field1 = 10;
//		field2 =10;  //instance필드는 static초기화 블럭에 올 수 없음
		method1();
//		method2();  //instance메소드도 static초기화 블럭에 올 수 없음
	}
	
	
	
	
}
