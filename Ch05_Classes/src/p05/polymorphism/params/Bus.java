package p05.polymorphism.params;
/** [parameter의 다형성]
 * 
 **/
public class Bus extends Vehicle {
	@Override
	public void run() {
		System.out.println("버스가 달립니다.");
	}
}
