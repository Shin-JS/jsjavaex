package p02.inherits;
/** [상속] (Car.java와 사용관계에 있음)
 * 
 **/
public class CarExample1 {
	public static void main(String[] args) {
		Bus bus = new Bus();
		System.out.println("탑승인원은 "+bus.a);
		bus.move();
		Ambulance ambulance = new Ambulance();
		ambulance.move();
		ambulance.special();
		FireEngine fireEngine = new FireEngine();
		fireEngine.move();
	}
}
