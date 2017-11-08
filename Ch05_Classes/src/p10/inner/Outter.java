package p10.inner;
/**[중첩클래스]
 * 
 **/
public class Outter {
	//메소드 안에 선언된 내부 클래스의 메소드값으로 사용되는 변수는 final(즉, 상수)
	//매개변수안에 (final int 변수)표기법은 -7까지의 표기법
	public void method1(final int arg) { //메소드의 매개변수가 final
		final int localVar = 1; //로컬변수 final
		//로컬 클래스
		class Inner{
			public void method() {
				//메소드내에 선언된 로컬클래스의 메소드에서 사용되는 변수들은 모두 final(즉, 상수만 올 수 있음)
				int result = arg + localVar;
			}
		}
	}
	//자바 8 이후
	//메소드의 매개변수나 메소드내의 선언된 로컬변수가 내부클래스에서 사용되려면 상수여야하므로 
	//매개변수와 로컬변수는 상수로 사용.
	//JAVA 7까지는 엄격한 문법을 적용했지만, JAVA8에서는 final을 제거함, 하지만 final의 성격은 그대로 유지됨
	public void method2(int arg) { //final(즉, 상수)
		int localVar = 1; //final(즉, 상수)
		class Inner{
			public void method() {
				int result = arg + localVar;
			}
		}
	}
}
