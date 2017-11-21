package p01.lambdas;
/**
 * -.람다식 블럭에는 클래스멤버인 필드와 메소드 제약없이 사용가능(접근가능)
 * -.람다식 실행블럭 내에서 this는 람다식을 실행한 객체의 참조
 * 
 **/
public class UsingThis {
	public int Field1 = 10;
	
	class Inner{
		int Field1 = 20;
		
		void method() {
			MyFunctionalInterface4 fi = ()->{
				System.out.println("outterField: " + Field1);
				//바깥객체의 참조를 얻기위해 클래스명.this사용
				System.out.println("outterField: " + UsingThis.this.Field1 + "\n");
				System.out.println("innerField: " + Field1);
				//람다식 내부에서 this는 Inner객체를 참조
				System.out.println("innerField: " +this.Field1+"\n");
			};
			fi.method();
		}

	}
}
