package p08.compare;

import java.util.Comparator;

/**[2진트리]
 * 객체 저장
 * comparator사용
 **/
public class DescendigComparator implements Comparator<Fruit>{

	@Override
	public int compare(Fruit o1, Fruit o2) {
		if(o1.price<o2.price) {
			return 1; //descending이라 1.. ascending할라면 -1
		}else if(o1.price==o2.price) {
			return 0;
		}else {
			return -1;
		}
	}

}
