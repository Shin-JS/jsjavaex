package p06.promotion;
/** [다형성, 상속, ]
 * -.객체의 다형성: 최상위 객체의 참조변수에는 상속을 받은 자식들의 instance객체가 대입 가능하며, 대입연산시 자동으로 형 변환이 일어남(→Promotion)
 **/
public class PromotionExample1 {
	public static void main(String[] args) {
		//객체참조변수 생성
		B b = new B();
		C c = new C();
		D d = new D();
		E e = new E();
		
		//최상위(A) 참조변수에 대입
		A a1 = b;  //자식 객체가 부모타입의 참조변수에 대입되면서 자동형변환. (Promotion)
		A a2 = c;  //자식 객체가 부모타입의 참조변수에 대입되면서 자동형변환. (Promotion)
		A a3 = d;  //자식 객체가 부모타입의 참조변수에 대입되면서 자동형변환. (Promotion)
		A a4 = e;  //자식 객체가 부모타입의 참조변수에 대입되면서 자동형변환. (Promotion)
		
		B b1 = d; //상속관계에서 자식의 객체가 부모타입의 참조변수에 대입되면서 자동형변환.(Promotion)
		C c1 = e; //상속관계에서 자식의 객체가 부모타입의 참조변수에 대입되면서 자동형변환.(Promotion)
		 
//		B b3 = e;  //상속관계가 아니므로 대입불가
//		C c3 = d;  //상속관계가 아니므로 대입불가
		
		
		//문법적으로는 가능하지만, 실행(Runtime)시 Casting 예외발생
		B b4 = new B();
		A a5 = b4;
//		C c4 = (C)a5; //
	}
}
