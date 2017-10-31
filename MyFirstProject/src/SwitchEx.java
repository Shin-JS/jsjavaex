
public class SwitchEx {
	public static void main(String[] args) {
		int month = 2;
		switch (month) {
		case 1:
			System.out.println("1월은 춥다");
			break;
		case 2:
			System.out.println("2월도 춥다");
			break;
		case 3:
			System.out.println("3월은 쌀쌀하다");
			break;

		default:
			break;
		}
		String str = "따뜻한 달";
		switch (str) {
		case "추운 달":
			System.out.println("1월,2월 11월, 12월");			
			break;
		case "따뜻한 달":
			System.out.println("3월, 4월, 10월, 11월");			
			break;
		default:
			break;
		}
		
		if (month == 1) {
			System.out.println("1월은 춥다");
		}else if (month == 2) {
			System.out.println("2월도 춥다");
		}else if (month == 3) {
			System.out.println("3월은 따뜻한가?");
		}
	}
}
