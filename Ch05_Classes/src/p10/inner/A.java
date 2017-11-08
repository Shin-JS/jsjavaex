package p10.inner;
/**[중첩클래스]
 * 
 **/
public class A { //바깥쪽클래스
	//생성자
	A(){
		System.out.println("A객체가 생성됨");
	}
	//멤버클래스(안쪽클래스)
	//인스턴스 멤버 클래스
	//인스턴스 멤버클래스에는 인스턴스 필드와 메소드만 올 수 있고, static필드와 메소드는 올 수 없다.
	public class B{
		//생성자
		B() {
			System.out.println("B객체가 생성됨");
		}
		//필드
		int field1; //인스턴스필드(앞에 static이 없다)
//		static int field2; //오류발생 이유: 인스턴스 멤버클래스에서는 static멤버필드가 올 수 없다.
		//메소드
		void method1() {} //인스턴스 메소드
//		static void method2() {}//오류발생 이유: 인스턴스멤버클래스에 static멤버 메소드가 올 수 없다.
	}
	//정적멤버 클래스(static member class)
	//static 클래스에는 인스턴스 필드, 메소드, static필드, 메소드 모두 올 수 있다.
	static class C {
		//생성자
		C() {
			System.out.println("C객체가 생성됨");
		}
		//필드
		int field1; //인스턴스 멤버 필드
		static int field2;//정적멤버 클래스에서는 정적멤버필드가 올 수 있다.
		//메소드
		void method1() {} //인스턴스멤버 메소드
		static void method2() {} //정적멤버 클래스에서는 정적멤버 메소드가 올 수 있다.
	}
	//바깥쪽클래스A의 메소드
	void method1() {
		//로컬클래스
		class D{ //외부에서는 로클 클래스 D에 접근 할 수 없음
			//생성자
			D(){
				System.out.println("D객체가 생성됨");
			}
				//필드
				int field1; //인스턴스 필드
//				static int field2; //오류발생이유: static필드는 올 수 없기때문에 오류 발생 
				//메소드
				void method() {} //인스턴스 메소드
//				static void method2() {}//오류발생이유: static메소드는 올 수 없기때문에 오류 발생				
			}//클래스 D 끝
		//객체 생성(클래스 A의 메소드1)
		D d = new D(); //① 객체 생성
		d.field1 = 3; //② 로컬클래스의 멤버필드 초기화
		d.method();  //③ 로컬메소드를 메소드의 멤버화
		}//method1끝

}//바깥클래스 끝
