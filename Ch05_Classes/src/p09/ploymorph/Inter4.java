package p09.ploymorph;
/**
 * Interface가 없는 상태
 * G1, G2가 바뀌면
 * Inter4도 바뀜.
 * 현재 소스파일 Inter4는 G1과 G2의 내용이 바뀌면 내용도 달라진다.
 * G1, G2대신 G3가 오게되면 G3에 새로 객체를 만들어서 추가해야하는 변화가 생긴다.
 * Inter4는 G1, G2에 종속적인 상태임 
 **/
public class Inter4 {
	public static void main(String[] args) {
		G1 g1 = new G1();
		G2 g2 = new G2();
		g1.play();
		g2.play();
	}
}

class G1{
	void play() {
		System.out.println("A play");
	}
}

class G2{
	void play() {
		System.out.println("B play");
	}
}
