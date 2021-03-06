package p10.inner;
/**[중첩클래스]
 * 
 **/
public class Main {
	public static void main(String[] args) {
		//객체 생성
		A a = new A(); //인스턴스를 만든 후, (첫번째)
		
		//인스턴스 멤버 클래스 객체 생성
		A.B b = a.new B(); //중첩클래스의 생성(바깥쪽클래스변수.new 안쪽생성자();의 형태)(두번째)
		b.field1 = 3; //중첩클래스의 필드에 접근
		b.method1(); //중첩클래스의 메소드에 접근
		
		//정적멤버 클래스 객체 생성
		A.C c = new A.C(); //바깥쪽클래스명.안쪽클래스명();의 형태로 생성
		c.field1 = 3; //정적 중첩 클래스의 인스턴스 필드
		c.method1(); //정적 중첩 클래스의 인스턴스 메소드
		A.C.field2 = 3; //정적 중첩 클래스의 정적 필드
		A.C.method2(); //정적 중첩 클래스의 정적 메소드
		
		//로컬 클래스 객체 생성 메소드 호출
		a.method1(); //바깥쪽 클래스의 메소드가 실행되어 안쪽클래스의 객체와 필드, 메소드가 생성됨
	}
}