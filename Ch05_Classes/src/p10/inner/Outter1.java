package p10.inner;
/**[중첩클래스]
 * -.중첩클래스에서 this의 사용
 *  ·this.필드, this.메소드는 중첩된 클래스 자신의 필드와 메소드를 호출하는것
 *  ·바깥쪽 클래스와 메소드를 호출하려면, 바깥쪽클래스명.this.필드, 바깥쪽클래스명.this.메소드 로 호출해야함
 **/
public class Outter1 {
	//인스턴스 필드
	String field = "Outter-field";
	//인스턴스 메소드
	void method() {
		System.out.println("Outter-method");
	}
	
	//인스턴스 멤버 클래스
	class Nested {
		//인스턴스 필드
		String field = "Nested-field";
		void method() {
			System.out.println("Nested-method");
		}
		void print() {
			//중첩클래스 참조
			System.out.println(this.field); //
			this.method(); 
			//바깥쪽클래스 참조
			System.out.println(Outter1.this.field);
			Outter1.this.method();
		}
	}
}
