package p05.polymorphism.params;
/** [parameter의 다형성]
 * 
 **/
public class Taxi extends Vehicle{
	@Override
	public void run() {
		System.out.println("택시가 달립니다.");
	}
}
