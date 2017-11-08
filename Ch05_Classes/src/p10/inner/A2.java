package p10.inner;
/**[중첩클래스]
 * 
 **/
public class A2 {
	//필드
	//인스턴스멤버
	int field1;
	void method1() {}
	//static멤버
	static int field2;
	static void method2() {}
	
	//인스턴스 클래스
	class B{
		void method() {
			field1 = 10; //인스턴스 필드 접근가능
			method1(); //인스턴스 메소드 접근가능
			//static필드와 메소드가 인스턴스메소드보다 먼저 생성되므로 만들어져있는 필드와 메소드 사용 가능
			field2 = 10; //static필드 접근가능
			method2(); //static메소드 접근가능
		}
	}
	//static 클래스
	static class C{
		void method() {
			//인스턴스필드와 메소드보다 static클래스의 메소드가 먼저 만들어져서 인스턴스 필드, 메소드를 사용하려는데 인스턴스 메소드와 필드는
			//만들어져 있지 않으므로 사용 불가
//		field1 = 10; //오류발생,
//		method1(); //오류발생,
		
		field2 = 10;
		method2();
		}
	}
}
