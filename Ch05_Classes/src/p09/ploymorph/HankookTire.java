package p09.ploymorph;
/**[인터페이스의 다형성]
 * 
 **/
public class HankookTire implements Tire{

	@Override
	public void roll() {
		System.out.println("한국타이어가 굴러갑니다.");
	}

}
