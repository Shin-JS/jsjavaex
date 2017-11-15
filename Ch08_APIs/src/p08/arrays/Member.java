package p08.arrays;
/**[API]
 * 객체의 비교는 동일한 타입이어야 비교대상이 됨
 * -.비교할 수 있는 객체를 만들기이 위해서는 Comparable인터페이스를 구현해야함
 * -.객체의 비교는 기준이 있어야 함(이 문서에서는 name으로 객체를 비교)
 * -.<타입>: 이 객체에 대상을 해당 타입으로 한정함(형 제한자: generic) 
 **/
public class Member implements Comparable<Member>{ //<>안에는 접근제한자(들어갈 타입을 지정해줘야함)
	//필드
	String name;
	//생성자
	public Member(String name) {
		this.name = name;
	}
	//메소드
	//객체의 비교 메소드 compareTo()
	@Override
	public int compareTo(Member o) { //매개변수로 대입되는 객체가 <>로 한정되어있어서 casting불필요
		return name.compareTo(o.name);
		//String의 compareTo()메소드는 두 문자열의 길이중 작은 길이까지만 비교함, 제일 앞의 값끼리 비교해서
		//크기가 크면 양수, 작으면 음수, 같으면 0을 리턴, 한글의 값비교는 유니코드끼리 비교
		//ex)홍(\ud64d)과 선(\uc120)의비교 = 유니코드값의 비교
	}
	
}
