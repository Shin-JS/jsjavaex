package p10.inner;
/**[중첩클래스]
 * 
 **/
public class OutterExample1 {
	public static void main(String[] args) {
		//바깥쪽객체 생성
		Outter1 outter = new Outter1();
		//안쪽객체 생성
		//바깥쪽클래스명.안쪽클래스명 변수 = 바깥쪽참조변수.new 안쪽생성자  (로 생성)
		Outter1.Nested nested = outter.new Nested();
		nested.print();
	}
}
